from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import get_current_user
from db import get_db
from models import Deadline, User

router = APIRouter(prefix="/stats", tags=["stats"])


class SubjectStat(BaseModel):
    subject: str
    count: int


class StatsResponse(BaseModel):
    total: int
    active: int
    done: int
    overdue: int
    by_subject: list[SubjectStat]


@router.get("", response_model=StatsResponse)
def get_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)

    base = db.query(Deadline).filter(Deadline.user_id == current_user.id)
    total = base.count()
    done = base.filter(Deadline.status == "done").count()
    overdue = (
        db.query(Deadline)
        .filter(
            Deadline.user_id == current_user.id,
            Deadline.status == "active",
            Deadline.due_at < now,
        )
        .count()
    )
    active = (
        db.query(Deadline)
        .filter(
            Deadline.user_id == current_user.id,
            Deadline.status == "active",
            Deadline.due_at >= now,
        )
        .count()
    )

    rows = (
        db.query(Deadline.subject, func.count(Deadline.id).label("count"))
        .filter(Deadline.user_id == current_user.id, Deadline.subject.isnot(None))
        .group_by(Deadline.subject)
        .all()
    )
    by_subject = [SubjectStat(subject=r.subject, count=r.count) for r in rows]

    return StatsResponse(total=total, active=active, done=done, overdue=overdue, by_subject=by_subject)
