from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth import create_jwt, get_current_user, verify_telegram_hash
from db import get_db
from models import User

router = APIRouter(prefix="/auth", tags=["auth"])


class TelegramAuthData(BaseModel):
    id: int
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    photo_url: str | None = None
    auth_date: int
    hash: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    tg_user_id: int
    username: str | None
    first_name: str | None
    last_name: str | None

    model_config = {"from_attributes": True}


@router.post("/telegram", response_model=TokenResponse)
def telegram_auth(data: TelegramAuthData, db: Session = Depends(get_db)):
    payload = data.model_dump(exclude_none=False)
    # build dict with only non-None values for hash check
    check_data = {k: v for k, v in payload.items() if v is not None}
    if not verify_telegram_hash(check_data):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Telegram auth data")

    user = db.query(User).filter(User.tg_user_id == data.id).first()
    if user:
        user.username = data.username
        user.first_name = data.first_name
        user.last_name = data.last_name
    else:
        user = User(
            tg_user_id=data.id,
            username=data.username,
            first_name=data.first_name,
            last_name=data.last_name,
        )
        db.add(user)
    db.commit()
    db.refresh(user)

    token = create_jwt(user.tg_user_id)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
