from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.models.campaign import Campaign
from app.models.event import Event
from app.models.blog import Blog
from app.models.forum import ForumThread

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("")
async def global_search(q: str, page: int = 1, limit: int = 10, db: AsyncSession = Depends(get_db)):
    if not q or len(q) < 2:
        raise HTTPException(400, "Query must be at least 2 characters")

    results = {"campaigns": [], "events": [], "blogs": [], "forum": []}

    # Campaigns
    campaigns = await db.execute(
        select(Campaign).where(
            Campaign.deleted_at.is_(None),
            or_(Campaign.title.ilike(f"%{q}%"), Campaign.description.ilike(f"%{q}%"))
        ).limit(5)
    )
    for c in campaigns.scalars().all():
        results["campaigns"].append({"id": str(c.id), "title": c.title, "type": "campaign", "url": f"/campaigns/{c.slug}"})

    # Events
    events = await db.execute(
        select(Event).where(Event.is_published == True, Event.title.ilike(f"%{q}%")).limit(5)
    )
    for e in events.scalars().all():
        results["events"].append({"id": str(e.id), "title": e.title, "type": "event", "url": f"/events/{e.slug}"})

    # Blogs
    blogs = await db.execute(
        select(Blog).where(Blog.is_published == True, or_(Blog.title.ilike(f"%{q}%"), Blog.excerpt.ilike(f"%{q}%"))).limit(5)
    )
    for b in blogs.scalars().all():
        results["blogs"].append({"id": str(b.id), "title": b.title, "type": "blog", "url": f"/blog/{b.slug}"})

    # Forum
    threads = await db.execute(
        select(ForumThread).where(ForumThread.deleted_at.is_(None), ForumThread.title.ilike(f"%{q}%")).limit(5)
    )
    for t in threads.scalars().all():
        results["forum"].append({"id": str(t.id), "title": t.title, "type": "forum", "url": f"/community/{t.id}"})

    total = sum(len(v) for v in results.values())
    return {"query": q, "total": total, "results": results}
