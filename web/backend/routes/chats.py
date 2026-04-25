from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import get_current_user
from db import get_db
from models import AvailableChat, ChatSubscription, User

router = APIRouter(prefix="/chats", tags=["chats"])


class AvailableChatResponse(BaseModel):
    chat_id: int
    chat_title: str | None
    subscribed: bool

    model_config = {"from_attributes": True}


class SubscriptionResponse(BaseModel):
    id: int
    chat_id: int
    notify_new_deadlines: bool
    notify_updates: bool
    notify_daily_digest: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class SubscribeRequest(BaseModel):
    chat_id: int


@router.get("/available", response_model=list[AvailableChatResponse])
def list_available_chats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chats = db.query(AvailableChat).all()
    subscribed_ids = {
        s.chat_id
        for s in db.query(ChatSubscription).filter(ChatSubscription.user_id == current_user.id).all()
    }
    return [
        AvailableChatResponse(
            chat_id=c.chat_id,
            chat_title=c.chat_title,
            subscribed=c.chat_id in subscribed_ids,
        )
        for c in chats
    ]


@router.get("/subscriptions", response_model=list[SubscriptionResponse])
def list_subscriptions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(ChatSubscription).filter(ChatSubscription.user_id == current_user.id).all()


@router.post("/subscriptions", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
def subscribe(
    body: SubscribeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(ChatSubscription).filter(
        ChatSubscription.user_id == current_user.id,
        ChatSubscription.chat_id == body.chat_id,
    ).first()
    if existing:
        return existing

    chat = db.query(AvailableChat).filter(AvailableChat.chat_id == body.chat_id).first()
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    sub = ChatSubscription(user_id=current_user.id, chat_id=body.chat_id)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.delete("/subscriptions/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsubscribe(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sub = db.query(ChatSubscription).filter(
        ChatSubscription.user_id == current_user.id,
        ChatSubscription.chat_id == chat_id,
    ).first()
    if not sub:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found")
    db.delete(sub)
    db.commit()
