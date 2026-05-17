from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.blog import Blog, BlogComment
from app.models.user import User, UserRoleEnum
import uuid, re

router = APIRouter(prefix="/blogs", tags=["Blog"])


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text + "-" + str(uuid.uuid4())[:8]


class BlogCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    cover_image: Optional[str] = None
    category: Optional[str] = None
    tags: List[str] = []
    is_published: bool = False


def blog_to_dict(b: Blog) -> dict:
    return {
        "id": str(b.id), "title": b.title, "slug": b.slug,
        "excerpt": b.excerpt, "cover_image": b.cover_image,
        "category": b.category, "tags": b.tags, "is_published": b.is_published,
        "is_featured": b.is_featured, "view_count": b.view_count,
        "author_id": str(b.author_id) if b.author_id else None,
        "created_at": b.created_at.isoformat(),
    }


@router.get("")
async def list_blogs(
    page: int = 1, limit: int = 10, category: Optional[str] = None,
    search: Optional[str] = None, db: AsyncSession = Depends(get_db),
):
    q = select(Blog).where(Blog.is_published == True, Blog.deleted_at.is_(None))
    if category:
        q = q.where(Blog.category == category)
    if search:
        q = q.where(Blog.title.ilike(f"%{search}%"))
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    q = q.order_by(Blog.is_featured.desc(), Blog.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    return {"total": total, "data": [blog_to_dict(b) for b in result.scalars().all()]}


@router.get("/{slug}")
async def get_blog(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Blog).where(Blog.slug == slug))
    b = result.scalar_one_or_none()
    if not b:
        raise HTTPException(404, "Blog not found")
    b.view_count = (b.view_count or 0) + 1
    return {**blog_to_dict(b), "content": b.content}


@router.post("", status_code=201)
async def create_blog(
    payload: BlogCreate, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    b = Blog(id=uuid.uuid4(), slug=slugify(payload.title), author_id=current_user.id, **payload.model_dump())
    db.add(b)
    await db.flush()
    return blog_to_dict(b)


@router.post("/{blog_id}/comments", status_code=201)
async def add_blog_comment(
    blog_id: str, content: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    c = BlogComment(id=uuid.uuid4(), blog_id=uuid.UUID(blog_id), author_id=current_user.id, content=content)
    db.add(c)
    await db.flush()
    return {"id": str(c.id), "content": c.content}
