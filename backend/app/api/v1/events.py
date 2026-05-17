from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.event import Event, EventAttendee
from app.models.user import User
import uuid, re
from datetime import datetime

router = APIRouter(prefix="/events", tags=["Events"])


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text + "-" + str(uuid.uuid4())[:8]


class EventCreate(BaseModel):
    title: str
    description: str
    category: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_date: datetime
    end_date: Optional[datetime] = None
    max_attendees: Optional[int] = None
    is_online: bool = False
    livestream_url: Optional[str] = None
    cover_image: Optional[str] = None


def event_to_dict(e: Event) -> dict:
    return {
        "id": str(e.id), "title": e.title, "slug": e.slug,
        "description": e.description, "category": e.category,
        "location": e.location, "latitude": e.latitude, "longitude": e.longitude,
        "start_date": e.start_date.isoformat(), "end_date": e.end_date.isoformat() if e.end_date else None,
        "max_attendees": e.max_attendees, "is_online": e.is_online,
        "livestream_url": e.livestream_url, "cover_image": e.cover_image,
        "is_published": e.is_published, "created_at": e.created_at.isoformat(),
    }


@router.get("")
async def list_events(
    page: int = 1, limit: int = 12,
    category: Optional[str] = None, search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(Event).where(Event.is_published == True, Event.deleted_at.is_(None))
    if category:
        q = q.where(Event.category == category)
    if search:
        q = q.where(Event.title.ilike(f"%{search}%"))
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    q = q.order_by(Event.start_date.asc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    return {"total": total, "data": [event_to_dict(e) for e in result.scalars().all()]}


@router.get("/{slug}")
async def get_event(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Event).where(Event.slug == slug))
    e = result.scalar_one_or_none()
    if not e:
        raise HTTPException(404, "Event not found")
    attendee_count = await db.scalar(select(func.count(EventAttendee.id)).where(EventAttendee.event_id == e.id))
    return {**event_to_dict(e), "attendee_count": attendee_count}


@router.post("", status_code=201)
async def create_event(
    payload: EventCreate, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    e = Event(id=uuid.uuid4(), slug=slugify(payload.title), created_by=current_user.id, **payload.model_dump())
    db.add(e)
    await db.flush()
    return event_to_dict(e)


@router.post("/{event_id}/rsvp", status_code=201)
async def rsvp_event(
    event_id: str, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = await db.execute(
        select(EventAttendee).where(
            EventAttendee.event_id == uuid.UUID(event_id),
            EventAttendee.user_id == current_user.id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Already RSVP'd")
    attendee = EventAttendee(id=uuid.uuid4(), event_id=uuid.UUID(event_id), user_id=current_user.id)
    db.add(attendee)
    await db.flush()
    return {"status": "attending", "event_id": event_id}
