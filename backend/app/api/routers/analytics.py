import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.db_models import Dataset, ConsumptionRecord
from app.schemas.schemas import APIResponse, AnalyticsResult
from app.services.analytics.calculator import calculate_analytics
from app.services.analytics.anomaly import detect_anomalies
from app.services.analytics.sustainability_index import calculate_sustainability_index

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/{dataset_id}", response_model=APIResponse[AnalyticsResult])
def get_analytics(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    records = db.query(ConsumptionRecord).filter(ConsumptionRecord.dataset_id == dataset_id).order_by(ConsumptionRecord.date.asc()).all()
    if not records:
        raise HTTPException(status_code=400, detail="Dataset has no consumption records.")

    # Convert to DataFrame
    data_list = []
    for r in records:
        data_list.append({
            "date": r.date,
            "bathing_liters": r.bathing,
            "laundry_liters": r.laundry,
            "cleaning_liters": r.cleaning,
            "cooking_liters": r.cooking,
            "gardening_liters": r.gardening,
            "drinking_liters": r.drinking,
            "toilet_liters": r.toilet,
            "other_liters": r.other,
            "total": r.total
        })

    df = pd.DataFrame(data_list)

    # Analytics calculation
    calc = calculate_analytics(df)
    anomalies = detect_anomalies(df)
    sust_score, label = calculate_sustainability_index(df)

    res = AnalyticsResult(
        dataset_id=dataset_id,
        total_consumption=calc["total_consumption"],
        mean_daily_consumption=calc["mean_daily_consumption"],
        median_daily_consumption=calc["median_daily_consumption"],
        min_daily_consumption=calc["min_daily_consumption"],
        max_daily_consumption=calc["max_daily_consumption"],
        std_dev_consumption=calc["std_dev_consumption"],
        highest_consuming_activity=calc["highest_consuming_activity"],
        lowest_consuming_activity=calc["lowest_consuming_activity"],
        sustainability_index=sust_score,
        sustainability_index_label=label,
        activity_breakdown=calc["activity_breakdown"],
        anomalies=anomalies,
        daily_trend=calc["daily_trend"],
        weekly_trend=calc["weekly_trend"],
        monthly_trend=calc["monthly_trend"]
    )

    return APIResponse(success=True, data=res)
