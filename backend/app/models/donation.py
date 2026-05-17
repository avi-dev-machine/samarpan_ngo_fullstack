import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Float, ForeignKey, Enum as SAEnum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class DonationStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class Donation(Base):
    __tablename__ = "donations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    donor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(SAEnum(DonationStatus), default=DonationStatus.PENDING)
    is_anonymous = Column(Boolean, default=False)
    payment_method = Column(String(50), nullable=True)
    transaction_id = Column(String(255), unique=True, nullable=True)
    receipt_url = Column(String(500), nullable=True)
    donor_name = Column(String(255), nullable=True)
    donor_email = Column(String(255), nullable=True)
    message = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    donor = relationship("User", back_populates="donations")
    campaign = relationship("Campaign", back_populates="donations")


class RecurringDonation(Base):
    __tablename__ = "recurring_donations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    donor_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    frequency = Column(String(20), default="monthly")  # weekly, monthly, yearly
    is_active = Column(Boolean, default=True)
    next_billing_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
