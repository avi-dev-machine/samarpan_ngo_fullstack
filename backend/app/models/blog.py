import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base


class Blog(Base):
    __tablename__ = "blogs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    slug = Column(String(500), unique=True, nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(String(500), nullable=True)
    cover_image = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)
    tags = Column(JSONB, default=list)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    is_published = Column(Boolean, default=False)
    is_featured = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    ai_summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = Column(DateTime(timezone=True), nullable=True)
    comments = relationship("BlogComment", back_populates="blog", lazy="select")


class BlogComment(Base):
    __tablename__ = "blog_comments"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    blog_id = Column(UUID(as_uuid=True), ForeignKey("blogs.id"), nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    blog = relationship("Blog", back_populates="comments")
