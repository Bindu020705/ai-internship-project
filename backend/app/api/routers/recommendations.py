import pandas as pd
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.db_models import Dataset, ConsumptionRecord, Recommendation
from app.schemas.schemas import APIResponse, RecommendationItem
from app.services.analytics.calculator import calculate_analytics
from app.services.analytics.anomaly import detect_anomalies
from app.services.forecasting.predictor import generate_forecast
from app.services.recommendations.engine import generate_hybrid_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("/{dataset_id}", response_model=APIResponse[List[RecommendationItem]])
async def get_dataset_recommendations(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    records = db.query(ConsumptionRecord).filter(ConsumptionRecord.dataset_id == dataset_id).order_by(ConsumptionRecord.date.asc()).all()
    if not records:
        raise HTTPException(status_code=400, detail="Dataset has no records.")

    # Check if recommendations already exist in DB
    existing = db.query(Recommendation).filter(Recommendation.dataset_id == dataset_id).all()
    if existing and len(existing) >= 3:
        items = [
            RecommendationItem(
                id=r.id,
                title=r.title,
                description=r.description,
                priority=r.priority,
                difficulty=r.difficulty,
                reason=r.reason or "",
                status=r.status
            ) for r in existing
        ]
        return APIResponse(success=True, data=items)

    # Calculate analytics & hybrid recommendations
    data_list = [{"date": r.date, "bathing_liters": r.bathing, "laundry_liters": r.laundry, "cleaning_liters": r.cleaning, "cooking_liters": r.cooking, "gardening_liters": r.gardening, "drinking_liters": r.drinking, "toilet_liters": r.toilet, "other_liters": r.other, "total": r.total} for r in records]
    df = pd.DataFrame(data_list)

    calc = calculate_analytics(df)
    anomalies = detect_anomalies(df)
    forecast = generate_forecast(df, 7)

    hybrid_res = await generate_hybrid_recommendations(calc, forecast)

    recs_list = []
    raw_recs = hybrid_res.get("recommendations", [])

    for r_item in raw_recs:
        rec_db = Recommendation(
            dataset_id=dataset_id,
            title=r_item.get("title", "Sustainability Action"),
            description=r_item.get("description", ""),
            priority=r_item.get("priority", "Medium"),
            difficulty=r_item.get("difficulty", "Easy"),
            reason=r_item.get("reason", "Based on activity distribution"),
            status="Suggested"
        )
        db.add(rec_db)
        recs_list.append(rec_db)

    db.commit()

    res = [
        RecommendationItem(
            id=r.id,
            title=r.title,
            description=r.description,
            priority=r.priority,
            difficulty=r.difficulty,
            reason=r.reason or "",
            status=r.status
        ) for r in recs_list
    ]

    return APIResponse(success=True, data=res)
