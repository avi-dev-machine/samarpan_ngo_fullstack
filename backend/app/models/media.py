import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Integer, Boolean, Float
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class MediaAsset(Base):
    __tablename__ = "media_assets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    uploader_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    filename = Column(String(500), nullable=False)
    original_filename = Column(String(500), nullable=True)
    file_url = Column(String(1000), nullable=False)
    file_type = Column(String(50), nullable=False)  # image, video, pdf, audio
    mime_type = Column(String(100), nullable=True)
    file_size = Column(Integer, nullable=True)
    category = Column(String(100), nullable=True)
    alt_text = Column(String(300), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))



