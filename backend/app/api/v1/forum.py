from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.forum import ForumThread, ForumComment
from app.models.user import User
import uuid

router = APIRouter(prefix="/forum", tags=["Community Forum"])


class ThreadCreate(BaseModel):
    title: str
    content: str
    category: Optional[str] = None


class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[str] = None


def thread_to_dict(t: ForumThread) -> dict:
    return {
        "id": str(t.id), "title": t.title, "content": t.content,
        "category": t.category, "is_pinned": t.is_pinned,
        "view_count": t.view_count, "like_count": t.like_count,
        "author_id": str(t.author_id), "created_at": t.created_at.isoformat(),
    }


@router.get("")
async def list_threads(
    page: int = 1, limit: int = 20,
    category: Optional[str] = None, search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(ForumThread).where(ForumThread.deleted_at.is_(None))
    if category:
        q = q.where(ForumThread.category == category)
    if search:
        q = q.where(ForumThread.title.ilike(f"%{search}%"))
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    q = q.order_by(ForumThread.is_pinned.desc(), ForumThread.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    return {"total": total, "data": [thread_to_dict(t) for t in result.scalars().all()]}


@router.post("", status_code=201)
async def create_thread(
    payload: ThreadCreate, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    t = ForumThread(id=uuid.uuid4(), author_id=current_user.id, **payload.model_dump())
    db.add(t)
    await db.flush()
    return thread_to_dict(t)


@router.get("/{thread_id}")
async def get_thread(thread_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ForumThread).where(ForumThread.id == uuid.UUID(thread_id)))
    t = result.scalar_one_or_none()
    if not t:
        raise HTTPException(404, "Thread not found")
    t.view_count = (t.view_count or 0) + 1
    comments_result = await db.execute(
        select(ForumComment).where(ForumComment.thread_id == t.id, ForumComment.deleted_at.is_(None), ForumComment.parent_id.is_(None))
        .order_by(ForumComment.created_at.asc())
    )
    comments = comments_result.scalars().all()
    return {
        **thread_to_dict(t),
        "comments": [
            {"id": str(c.id), "content": c.content, "like_count": c.like_count, "created_at": c.created_at.isoformat()}
            for c in comments
        ]
    }


@router.post("/{thread_id}/comments", status_code=201)
async def add_comment(
    thread_id: str, payload: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    c = ForumComment(
        id=uuid.uuid4(), thread_id=uuid.UUID(thread_id),
        author_id=current_user.id, content=payload.content,
        parent_id=uuid.UUID(payload.parent_id) if payload.parent_id else None,
    )
    db.add(c)
    await db.flush()
    return {"id": str(c.id), "content": c.content, "created_at": c.created_at.isoformat()}


@router.post("/{thread_id}/like")
async def like_thread(thread_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ForumThread).where(ForumThread.id == uuid.UUID(thread_id)))
    t = result.scalar_one_or_none()
    if not t:
        raise HTTPException(404, "Thread not found")
    t.like_count = (t.like_count or 0) + 1
    return {"like_count": t.like_count}
