import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class ResourceTracking(Base):
    __tablename__ = "resource_tracking"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    type = Column(String(100), nullable=False)
    quantity = Column(String(50), default="0")
    unit = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    status = Column(String(50), default="available")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
