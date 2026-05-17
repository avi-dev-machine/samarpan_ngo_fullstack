import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base


class Volunteer(Base):
    __tablename__ = "volunteers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    is_verified = Column(Boolean, default=False)
    verification_status = Column(String(50), default="pending")
    id_document_url = Column(String(500), nullable=True)
    availability = Column(JSONB, default=dict)
    total_hours = Column(Float, default=0.0)
    reputation_points = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="volunteer")
    skills = relationship("VolunteerSkill", back_populates="volunteer", lazy="select")
    hours = relationship("VolunteerHours", back_populates="volunteer", lazy="select")
    badges = relationship("VolunteerBadge", back_populates="volunteer", lazy="select")


class VolunteerSkill(Base):
    __tablename__ = "volunteer_skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    volunteer_id = Column(UUID(as_uuid=True), ForeignKey("volunteers.id"), nullable=False)
    skill = Column(String(100), nullable=False)
    level = Column(String(50), default="beginner")

    volunteer = relationship("Volunteer", back_populates="skills")


class VolunteerHours(Base):
    __tablename__ = "volunteer_hours"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    volunteer_id = Column(UUID(as_uuid=True), ForeignKey("volunteers.id"), nullable=False)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=True)
    hours = Column(Float, nullable=False)
    description = Column(String(500), nullable=True)
    logged_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    volunteer = relationship("Volunteer", back_populates="hours")


class VolunteerBadge(Base):
    __tablename__ = "volunteer_badges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    volunteer_id = Column(UUID(as_uuid=True), ForeignKey("volunteers.id"), nullable=False)
    badge_name = Column(String(100), nullable=False)
    badge_icon = Column(String(50), nullable=True)
    description = Column(String(300), nullable=True)
    awarded_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    volunteer = relationship("Volunteer", back_populates="badges")
