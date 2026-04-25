from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import get_current_user
from db import get_db
from models import Deadline, User

router = APIRouter(prefix="/deadlines", tags=["deadlines"])


class DeadlineResponse(BaseModel):
    id: int
    title: str
    subject: str | None
    due_at: datetime
    status: str
    source_text: str
    source_chat_id: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class DeadlinePatch(BaseModel):
    status: Optional[str] = None


@router.get("", response_model=list[DeadlineResponse])
def list_deadlines(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Deadline)
        .filter(Deadline.user_id == current_user.id)
        .order_by(Deadline.due_at)
        .all()
    )


@router.patch("/{deadline_id}", response_model=DeadlineResponse)
def update_deadline(
    deadline_id: int,
    body: DeadlinePatch,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deadline = db.query(Deadline).filter(
        Deadline.id == deadline_id, Deadline.user_id == current_user.id
    ).first()
    if not deadline:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deadline not found")
    if body.status is not None:
        deadline.status = body.status
    db.commit()
    db.refresh(deadline)
    return deadline


@router.delete("/{deadline_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deadline(
    deadline_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    deadline = db.query(Deadline).filter(
        Deadline.id == deadline_id, Deadline.user_id == current_user.id
    ).first()
    if not deadline:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deadline not found")
    db.delete(deadline)
    db.commit()
