from typing import Dict, Any, List
from app.services.rag.retriever import retrieve_knowledge_context
from app.services.llm.prompts import build_analysis_prompt, SYSTEM_PROMPT
from app.services.llm.parser import generate_structured_llm_response

async def generate_hybrid_recommendations(
    analytics_data: Dict[str, Any],
    forecast_data: Dict[str, Any] = None
) -> Dict[str, Any]:
    highest_act = analytics_data.get("highest_consuming_activity", "General")
    anomalies = analytics_data.get("anomalies", [])

    # 1. Deterministic Rule Phase: Determine search query for RAG
    query_parts = [f"efficient {highest_act.lower()}", "household water conservation"]
    if anomalies:
        query_parts.append("leak detection and meter check")
    rag_query = " ".join(query_parts)

    # 2. RAG Retrieval Phase
    rag_context, sources = retrieve_knowledge_context(rag_query, top_k=4)

    # 3. Prompt Construction Phase
    prompt = build_analysis_prompt(
        analytics_data=analytics_data,
        forecast_data=forecast_data,
        rag_context=rag_context
    )

    # 4. LLM Synthesis Phase
    structured_ai_output = await generate_structured_llm_response(prompt, system_prompt=SYSTEM_PROMPT)

    # Attach sources
    structured_ai_output["sources"] = sources
    return structured_ai_output
