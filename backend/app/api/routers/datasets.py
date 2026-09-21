import os
import sys
import pandas as pd
from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.config import settings
from app.models.db_models import Dataset, ConsumptionRecord
from app.schemas.schemas import (
    APIResponse,
    DatasetResponse,
    ConsumptionRecordResponse,
    SyntheticDatasetCreate,
    ManualDatasetCreate,
    RecordCreate,
    RecordUpdate
)
from app.services.analytics.validator import validate_and_clean_csv

# Add project root for script import if needed
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..")))
from scripts.generate_demo_data import generate_synthetic_records, generate_water_consumption_data

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.post("/upload", response_model=APIResponse[DatasetResponse])
async def upload_dataset(
    file: UploadFile = File(...),
    name: str = Form(None),
    db: Session = Depends(get_db)
):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")

    content = await file.read()
    is_valid, df, errors = validate_and_clean_csv(content)

    if not is_valid and df.empty:
        raise HTTPException(status_code=400, detail=f"Validation failed: {'; '.join(errors)}")

    ds_name = name or file.filename.replace(".csv", "")
    dataset = Dataset(name=ds_name, source="upload", row_count=len(df))
    db.add(dataset)
    db.flush()

    records = []
    for _, row in df.iterrows():
        rec = ConsumptionRecord(
            dataset_id=dataset.id,
            date=str(row['date']),
            bathing=float(row.get('bathing_liters', 0.0)),
            laundry=float(row.get('laundry_liters', 0.0)),
            cleaning=float(row.get('cleaning_liters', 0.0)),
            cooking=float(row.get('cooking_liters', 0.0)),
            gardening=float(row.get('gardening_liters', 0.0)),
            drinking=float(row.get('drinking_liters', 0.0)),
            toilet=float(row.get('toilet_liters', 0.0)),
            other=float(row.get('other_liters', 0.0)),
            total=float(row['total'])
        )
        records.append(rec)

    db.bulk_save_objects(records)
    db.commit()
    db.refresh(dataset)

    msg = "Dataset uploaded successfully."
    if errors:
        msg += f" Note: {'; '.join(errors)}"

    return APIResponse(success=True, message=msg, data=DatasetResponse.model_validate(dataset))

@router.post("/demo", response_model=APIResponse[DatasetResponse])
def load_demo_dataset(db: Session = Depends(get_db)):
    demo_path = settings.DEMO_DATASET_PATH
    if not os.path.exists(demo_path):
        generate_water_consumption_data(60, demo_path)

    with open(demo_path, "rb") as f:
        content = f.read()

    _, df, _ = validate_and_clean_csv(content)
    
    dataset = Dataset(name="Demo Household Water Consumption (60 Days Synthetic)", source="demo", row_count=len(df))
    db.add(dataset)
    db.flush()

    records = []
    for _, row in df.iterrows():
        rec = ConsumptionRecord(
            dataset_id=dataset.id,
            date=str(row['date']),
            bathing=float(row.get('bathing_liters', 0.0)),
            laundry=float(row.get('laundry_liters', 0.0)),
            cleaning=float(row.get('cleaning_liters', 0.0)),
            cooking=float(row.get('cooking_liters', 0.0)),
            gardening=float(row.get('gardening_liters', 0.0)),
            drinking=float(row.get('drinking_liters', 0.0)),
            toilet=float(row.get('toilet_liters', 0.0)),
            other=float(row.get('other_liters', 0.0)),
            total=float(row['total'])
        )
        records.append(rec)

    db.bulk_save_objects(records)
    db.commit()
    db.refresh(dataset)

    return APIResponse(
        success=True,
        message="Demo synthetic dataset loaded successfully. All data clearly marked as Synthetic Demo Data.",
        data=DatasetResponse.model_validate(dataset)
    )

@router.post("/synthetic", response_model=APIResponse[DatasetResponse])
def create_synthetic_dataset(payload: SyntheticDatasetCreate, db: Session = Depends(get_db)):
    synthetic_records = generate_synthetic_records(
        num_days=payload.num_days,
        household_members=payload.household_members,
        anomaly_level=payload.anomaly_level,
        profile=payload.profile
    )
    
    ds_name = payload.name or f"Synthetic Dataset ({payload.num_days} Days, {payload.household_members} Members)"
    dataset = Dataset(name=ds_name, source="synthetic", row_count=len(synthetic_records))
    db.add(dataset)
    db.flush()

    records = []
    for r in synthetic_records:
        bathing = float(r.get('bathing_liters', 0.0))
        laundry = float(r.get('laundry_liters', 0.0))
        cleaning = float(r.get('cleaning_liters', 0.0))
        cooking = float(r.get('cooking_liters', 0.0))
        gardening = float(r.get('gardening_liters', 0.0))
        drinking = float(r.get('drinking_liters', 0.0))
        toilet = float(r.get('toilet_liters', 0.0))
        other = float(r.get('other_liters', 0.0))
        tot = bathing + laundry + cleaning + cooking + gardening + drinking + toilet + other
        
        rec = ConsumptionRecord(
            dataset_id=dataset.id,
            date=str(r['date']),
            bathing=bathing,
            laundry=laundry,
            cleaning=cleaning,
            cooking=cooking,
            gardening=gardening,
            drinking=drinking,
            toilet=toilet,
            other=other,
            total=round(tot, 2)
        )
        records.append(rec)

    db.bulk_save_objects(records)
    db.commit()
    db.refresh(dataset)

    return APIResponse(
        success=True,
        message=f"Custom synthetic dataset '{ds_name}' with {len(synthetic_records)} records created successfully.",
        data=DatasetResponse.model_validate(dataset)
    )

@router.post("/manual", response_model=APIResponse[DatasetResponse])
def create_manual_dataset(payload: ManualDatasetCreate, db: Session = Depends(get_db)):
    if not payload.records:
        raise HTTPException(status_code=400, detail="At least one daily consumption record must be provided.")

    dataset = Dataset(name=payload.name, source="manual", row_count=len(payload.records))
    db.add(dataset)
    db.flush()

    records = []
    for rec_data in payload.records:
        tot = (rec_data.bathing + rec_data.laundry + rec_data.cleaning + 
               rec_data.cooking + rec_data.gardening + rec_data.drinking + 
               rec_data.toilet + rec_data.other)
        
        rec = ConsumptionRecord(
            dataset_id=dataset.id,
            date=rec_data.date,
            bathing=rec_data.bathing,
            laundry=rec_data.laundry,
            cleaning=rec_data.cleaning,
            cooking=rec_data.cooking,
            gardening=rec_data.gardening,
            drinking=rec_data.drinking,
            toilet=rec_data.toilet,
            other=rec_data.other,
            total=round(tot, 2)
        )
        records.append(rec)

    db.bulk_save_objects(records)
    db.commit()
    db.refresh(dataset)

    return APIResponse(
        success=True,
        message=f"Manual dataset '{payload.name}' created with {len(payload.records)} records.",
        data=DatasetResponse.model_validate(dataset)
    )

@router.get("", response_model=APIResponse[List[DatasetResponse]])
def list_datasets(db: Session = Depends(get_db)):
    datasets = db.query(Dataset).order_by(Dataset.created_at.desc()).all()
    res = [DatasetResponse.model_validate(d) for d in datasets]
    return APIResponse(success=True, data=res)

@router.get("/{dataset_id}", response_model=APIResponse[dict])
def get_dataset_details(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    records = db.query(ConsumptionRecord).filter(ConsumptionRecord.dataset_id == dataset_id).order_by(ConsumptionRecord.date.asc()).all()
    rec_data = [ConsumptionRecordResponse.model_validate(r) for r in records]

    return APIResponse(
        success=True,
        data={
            "dataset": DatasetResponse.model_validate(dataset),
            "records": rec_data
        }
    )

@router.post("/{dataset_id}/records", response_model=APIResponse[ConsumptionRecordResponse])
def add_record(dataset_id: str, payload: RecordCreate, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    tot = (payload.bathing + payload.laundry + payload.cleaning + payload.cooking +
           payload.gardening + payload.drinking + payload.toilet + payload.other)

    record = ConsumptionRecord(
        dataset_id=dataset.id,
        date=payload.date,
        bathing=payload.bathing,
        laundry=payload.laundry,
        cleaning=payload.cleaning,
        cooking=payload.cooking,
        gardening=payload.gardening,
        drinking=payload.drinking,
        toilet=payload.toilet,
        other=payload.other,
        total=round(tot, 2)
    )
    db.add(record)
    dataset.row_count += 1
    db.commit()
    db.refresh(record)

    return APIResponse(success=True, message="Record added successfully.", data=ConsumptionRecordResponse.model_validate(record))

@router.put("/{dataset_id}/records/{record_id}", response_model=APIResponse[ConsumptionRecordResponse])
def update_record(dataset_id: str, record_id: str, payload: RecordUpdate, db: Session = Depends(get_db)):
    record = db.query(ConsumptionRecord).filter(
        ConsumptionRecord.id == record_id,
        ConsumptionRecord.dataset_id == dataset_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found for this dataset.")

    if payload.date is not None:
        record.date = payload.date
    if payload.bathing is not None:
        record.bathing = payload.bathing
    if payload.laundry is not None:
        record.laundry = payload.laundry
    if payload.cleaning is not None:
        record.cleaning = payload.cleaning
    if payload.cooking is not None:
        record.cooking = payload.cooking
    if payload.gardening is not None:
        record.gardening = payload.gardening
    if payload.drinking is not None:
        record.drinking = payload.drinking
    if payload.toilet is not None:
        record.toilet = payload.toilet
    if payload.other is not None:
        record.other = payload.other

    tot = (record.bathing + record.laundry + record.cleaning + record.cooking +
           record.gardening + record.drinking + record.toilet + record.other)
    record.total = round(tot, 2)

    db.commit()
    db.refresh(record)

    return APIResponse(success=True, message="Record updated successfully.", data=ConsumptionRecordResponse.model_validate(record))

@router.delete("/{dataset_id}/records/{record_id}", response_model=APIResponse[dict])
def delete_record(dataset_id: str, record_id: str, db: Session = Depends(get_db)):
    record = db.query(ConsumptionRecord).filter(
        ConsumptionRecord.id == record_id,
        ConsumptionRecord.dataset_id == dataset_id
    ).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found for this dataset.")

    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    db.delete(record)
    if dataset and dataset.row_count > 0:
        dataset.row_count -= 1
    db.commit()

    return APIResponse(success=True, message=f"Record {record_id} deleted successfully.")

@router.delete("/{dataset_id}", response_model=APIResponse[dict])
def delete_dataset(dataset_id: str, db: Session = Depends(get_db)):
    dataset = db.query(Dataset).filter(Dataset.id == dataset_id).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    
    db.delete(dataset)
    db.commit()
    return APIResponse(success=True, message=f"Dataset {dataset_id} deleted successfully.")

