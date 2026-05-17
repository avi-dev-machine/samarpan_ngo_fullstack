from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.notification import Notification
from app.models.user import User
import uuid

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("")
async def get_notifications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    notes = result.scalars().all()
    return [
        {"id": str(n.id), "title": n.title, "body": n.body,
         "type": n.type, "is_read": n.is_read, "created_at": n.created_at.isoformat()}
        for n in notes
    ]


@router.post("/{notification_id}/read")
async def mark_read(
    notification_id: str, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Notification).where(
            Notification.id == uuid.UUID(notification_id),
            Notification.user_id == current_user.id,
        )
    )
    n = result.scalar_one_or_none()
    if n:
        n.is_read = True
    return {"status": "ok"}


@router.post("/read-all")
async def mark_all_read(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from sqlalchemy import update
    await db.execute(
        Notification.__table__.update()
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    return {"status": "ok"}
