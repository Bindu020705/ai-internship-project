import pandas as pd
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.db_models import Dataset, ConsumptionRecord
from app.schemas.schemas import APIResponse, ForecastResult
from app.services.forecasting.predictor import generate_forecast

router = APIRouter(prefix="/forecast", tags=["Forecasting"])

@router.get("/{dataset_id}", response_model=APIResponse[ForecastResult])
def get_forecast(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    records = db.query(ConsumptionRecord).filter(ConsumptionRecord.dataset_id == dataset_id).order_by(ConsumptionRecord.date.asc()).all()
    if not records:
        raise HTTPException(status_code=400, detail="Dataset has no records.")

    data_list = [{"date": r.date, "total": r.total} for r in records]
    df = pd.DataFrame(data_list)

    fc_res = generate_forecast(df, forecast_days=7)

    res = ForecastResult(
        dataset_id=dataset_id,
        has_enough_data=fc_res["has_enough_data"],
        disclaimer=fc_res["disclaimer"],
        predictions=fc_res["predictions"],
        confidence=fc_res["confidence"]
    )

    return APIResponse(success=True, data=res)
