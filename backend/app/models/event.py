import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    cover_image = Column(String(500), nullable=True)
    location = Column(String(255), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=True)
    max_attendees = Column(Integer, nullable=True)
    is_online = Column(Boolean, default=False)
    livestream_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=True)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    attendees = relationship("EventAttendee", back_populates="event", lazy="select")


class EventAttendee(Base):
    __tablename__ = "event_attendees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    rsvp_status = Column(String(50), default="attending")
    checked_in = Column(Boolean, default=False)
    registered_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    event = relationship("Event", back_populates="attendees")
