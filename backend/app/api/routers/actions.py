from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.db_models import ActionPlanItem
from app.schemas.schemas import APIResponse, ActionItemSchema, ActionItemCreate, ActionItemUpdate

router = APIRouter(prefix="/actions", tags=["Action Plan"])

@router.get("", response_model=APIResponse[List[ActionItemSchema]])
def list_action_items(db: Session = Depends(get_db)):
    items = db.query(ActionPlanItem).order_by(ActionPlanItem.created_at.desc()).all()
    res = [ActionItemSchema.model_validate(i) for i in items]
    return APIResponse(success=True, data=res)

@router.post("", response_model=APIResponse[ActionItemSchema])
def create_action_item(payload: ActionItemCreate, db: Session = Depends(get_db)):
    item = ActionPlanItem(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        difficulty=payload.difficulty,
        status="Not Started"
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return APIResponse(success=True, message="Action item added to plan.", data=ActionItemSchema.model_validate(item))

@router.patch("/{action_id}", response_model=APIResponse[ActionItemSchema])
def update_action_item(action_id: str, payload: ActionItemUpdate, db: Session = Depends(get_db)):
    item = db.query(ActionPlanItem).filter(ActionPlanItem.id == action_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action plan item not found")

    if payload.status:
        item.status = payload.status
        if payload.status == "Completed":
            item.completed_at = datetime.utcnow()
        else:
            item.completed_at = None

    db.commit()
    db.refresh(item)
    return APIResponse(success=True, message=f"Action item status updated to {item.status}", data=ActionItemSchema.model_validate(item))

@router.delete("/{action_id}", response_model=APIResponse[dict])
def delete_action_item(action_id: str, db: Session = Depends(get_db)):
    item = db.query(ActionPlanItem).filter(ActionPlanItem.id == action_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action plan item not found")

    db.delete(item)
    db.commit()
    return APIResponse(success=True, message="Action item removed from plan.")
