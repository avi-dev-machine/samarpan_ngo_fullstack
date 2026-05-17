from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.core.deps import get_current_user, get_current_user_optional, require_role
from app.models.campaign import Campaign, CampaignStatus, CampaignUpdate
from app.models.user import User, UserRoleEnum
from app.websockets.manager import manager
import uuid, re
from datetime import datetime, timezone

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text + "-" + str(uuid.uuid4())[:8]


class CampaignCreate(BaseModel):
    title: str
    description: str
    short_description: Optional[str] = None
    category: str
    goal_amount: float
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    volunteers_needed: int = 0
    end_date: Optional[datetime] = None
    cover_image: Optional[str] = None
    is_emergency: bool = False


class CampaignUpdateCreate(BaseModel):
    title: str
    content: str


def campaign_to_dict(c: Campaign) -> dict:
    return {
        "id": str(c.id), "title": c.title, "slug": c.slug,
        "description": c.description, "short_description": c.short_description,
        "category": c.category, "status": c.status,
        "goal_amount": c.goal_amount, "raised_amount": c.raised_amount,
        "beneficiary_count": c.beneficiary_count, "volunteers_needed": c.volunteers_needed,
        "location": c.location, "latitude": c.latitude, "longitude": c.longitude,
        "cover_image": c.cover_image, "is_featured": c.is_featured,
        "is_emergency": c.is_emergency, "view_count": c.view_count,
        "like_count": c.like_count, "end_date": c.end_date.isoformat() if c.end_date else None,
        "created_at": c.created_at.isoformat(),
        "progress_pct": round((c.raised_amount / c.goal_amount * 100) if c.goal_amount > 0 else 0, 1),
    }


@router.get("")
async def list_campaigns(
    page: int = 1, limit: int = 12,
    category: Optional[str] = None, status: Optional[str] = None,
    search: Optional[str] = None, is_emergency: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
):
    q = select(Campaign).where(Campaign.deleted_at.is_(None))
    if category:
        q = q.where(Campaign.category == category)
    if status:
        q = q.where(Campaign.status == status)
    if is_emergency is not None:
        q = q.where(Campaign.is_emergency == is_emergency)
    if search:
        q = q.where(or_(Campaign.title.ilike(f"%{search}%"), Campaign.description.ilike(f"%{search}%")))
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    q = q.order_by(Campaign.is_featured.desc(), Campaign.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    campaigns = result.scalars().all()
    return {"total": total, "page": page, "limit": limit, "data": [campaign_to_dict(c) for c in campaigns]}


@router.get("/{slug}")
async def get_campaign(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campaign).where(Campaign.slug == slug, Campaign.deleted_at.is_(None)))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(404, "Campaign not found")
    c.view_count = (c.view_count or 0) + 1
    return campaign_to_dict(c)


@router.post("", status_code=201)
async def create_campaign(
    payload: CampaignCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRoleEnum.CAMPAIGN_MANAGER, UserRoleEnum.SUPER_ADMIN)),
):
    c = Campaign(id=uuid.uuid4(), slug=slugify(payload.title), **payload.model_dump(), created_by=current_user.id)
    db.add(c)
    await db.flush()
    await manager.broadcast_all({"type": "campaign_created", "data": campaign_to_dict(c)})
    return campaign_to_dict(c)


@router.post("/{campaign_id}/updates", status_code=201)
async def add_campaign_update(
    campaign_id: str, payload: CampaignUpdateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Campaign).where(Campaign.id == uuid.UUID(campaign_id)))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(404, "Campaign not found")
    update = CampaignUpdate(id=uuid.uuid4(), campaign_id=c.id, **payload.model_dump())
    db.add(update)
    await manager.broadcast_all({"type": "campaign_update", "campaign_id": campaign_id})
    return {"id": str(update.id), "title": update.title, "content": update.content}


@router.post("/{campaign_id}/like")
async def like_campaign(campaign_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Campaign).where(Campaign.id == uuid.UUID(campaign_id)))
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(404, "Campaign not found")
    c.like_count = (c.like_count or 0) + 1
    return {"like_count": c.like_count}
