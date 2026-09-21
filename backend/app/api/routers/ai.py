import pandas as pd
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.db_models import Dataset, ConsumptionRecord, ChatSession, ChatMessage
from app.schemas.schemas import APIResponse, ChatRequest, ChatResponse, RAGChunk
from app.services.analytics.calculator import calculate_analytics
from app.services.analytics.anomaly import detect_anomalies
from app.services.forecasting.predictor import generate_forecast
from app.services.rag.retriever import retrieve_knowledge_context
from app.services.llm.prompts import SYSTEM_PROMPT
from app.services.llm.parser import get_llm_provider, generate_structured_llm_response

router = APIRouter(prefix="/ai", tags=["AI Services"])

@router.post("/insights", response_model=APIResponse[dict])
async def get_ai_insights(dataset_id: str = Body(..., embed=True), db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    records = db.query(ConsumptionRecord).filter(ConsumptionRecord.dataset_id == dataset_id).order_by(ConsumptionRecord.date.asc()).all()
    if not records:
        raise HTTPException(status_code=400, detail="Dataset has no records.")

    data_list = [{"date": r.date, "bathing_liters": r.bathing, "laundry_liters": r.laundry, "cleaning_liters": r.cleaning, "cooking_liters": r.cooking, "gardening_liters": r.gardening, "drinking_liters": r.drinking, "toilet_liters": r.toilet, "other_liters": r.other, "total": r.total} for r in records]
    df = pd.DataFrame(data_list)

    calc = calculate_analytics(df)
    anomalies = detect_anomalies(df)
    forecast = generate_forecast(df, forecast_days=7)

    highest_act = calc.get("highest_consuming_activity", "general")
    rag_context, sources = retrieve_knowledge_context(f"water conservation efficiency {highest_act}", top_k=4)

    prompt = f"""USER DATA SUMMARY:
Total Consumption: {calc['total_consumption']} L
Average Daily Consumption: {calc['mean_daily_consumption']} L/day
Highest Consuming Activity: {highest_act}

ANOMALIES:
{anomalies}

RETRIEVED KNOWLEDGE:
{rag_context}

Please provide structured AI recommendations in valid JSON.
"""

    res_data = await generate_structured_llm_response(prompt, system_prompt=SYSTEM_PROMPT)
    res_data["sources"] = sources
    return APIResponse(success=True, data=res_data)

@router.post("/chat", response_model=APIResponse[ChatResponse])
async def chat_with_assistant(request: ChatRequest, db: Session = Depends(get_db)):
    session_id = request.session_id
    if not session_id:
        session = ChatSession()
        db.add(session)
        db.commit()
        db.refresh(session)
        session_id = session.id

    # 1. RAG retrieval for question
    rag_context, sources = retrieve_knowledge_context(request.question, top_k=4)

    # 2. Extract dataset analytics context if dataset_id provided
    analytics_context_str = "No specific user dataset selected."
    if request.dataset_id:
        records = db.query(ConsumptionRecord).filter(ConsumptionRecord.dataset_id == request.dataset_id).order_by(ConsumptionRecord.date.asc()).all()
        if records:
            data_list = [{"date": r.date, "bathing_liters": r.bathing, "laundry_liters": r.laundry, "cleaning_liters": r.cleaning, "cooking_liters": r.cooking, "gardening_liters": r.gardening, "drinking_liters": r.drinking, "toilet_liters": r.toilet, "other_liters": r.other, "total": r.total} for r in records]
            df = pd.DataFrame(data_list)
            calc = calculate_analytics(df)
            analytics_context_str = f"User Daily Average: {calc['mean_daily_consumption']} L/day, Highest Activity: {calc['highest_consuming_activity']} ({calc['activity_breakdown'][0]['percentage']}%)."

    # 3. Prompt Construction
    chat_prompt = f"""USER CONTEXT DATA:
{analytics_context_str}

RETRIEVED KNOWLEDGE CONTEXT:
{rag_context}

USER QUESTION:
{request.question}

Provide a helpful, grounded, and concise answer directly addressing the user's question. Reference retrieved knowledge and user data when relevant.
"""

    provider = get_llm_provider()
    answer_text = await provider.generate(chat_prompt, system_prompt=SYSTEM_PROMPT)

    # Save to database
    user_msg = ChatMessage(session_id=session_id, role="user", content=request.question)
    asst_msg = ChatMessage(session_id=session_id, role="assistant", content=answer_text, sources_json=sources)
    db.add(user_msg)
    db.add(asst_msg)
    db.commit()

    rag_chunks = [RAGChunk(**s) for s in sources]

    return APIResponse(
        success=True,
        data=ChatResponse(
            session_id=session_id,
            answer=answer_text,
            sources=rag_chunks
        )
    )
