from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user_optional
from app.models.donation import Donation, DonationStatus, RecurringDonation
from app.models.campaign import Campaign
from app.models.user import User
from app.websockets.manager import manager
import uuid
from datetime import datetime, timezone

router = APIRouter(prefix="/donations", tags=["Donations"])


class DonationCreate(BaseModel):
    campaign_id: Optional[str] = None
    amount: float
    currency: str = "INR"
    is_anonymous: bool = False
    donor_name: Optional[str] = None
    donor_email: Optional[str] = None
    message: Optional[str] = None
    payment_method: str = "card"


class RecurringCreate(BaseModel):
    campaign_id: Optional[str] = None
    amount: float
    currency: str = "INR"
    frequency: str = "monthly"


def donation_to_dict(d: Donation) -> dict:
    return {
        "id": str(d.id), "amount": d.amount, "currency": d.currency,
        "status": d.status, "is_anonymous": d.is_anonymous,
        "donor_name": "Anonymous" if d.is_anonymous else d.donor_name,
        "message": d.message, "campaign_id": str(d.campaign_id) if d.campaign_id else None,
        "created_at": d.created_at.isoformat(),
    }


@router.post("", status_code=201)
async def create_donation(
    payload: DonationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user_optional),
):
    txn_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
    donation = Donation(
        id=uuid.uuid4(),
        donor_id=current_user.id if current_user else None,
        campaign_id=uuid.UUID(payload.campaign_id) if payload.campaign_id else None,
        amount=payload.amount, currency=payload.currency,
        is_anonymous=payload.is_anonymous,
        donor_name=payload.donor_name or (current_user.full_name if current_user else "Anonymous"),
        donor_email=payload.donor_email or (current_user.email if current_user else None),
        message=payload.message, payment_method=payload.payment_method,
        transaction_id=txn_id, status=DonationStatus.COMPLETED,
    )
    db.add(donation)

    # Update campaign raised amount
    if payload.campaign_id:
        result = await db.execute(select(Campaign).where(Campaign.id == uuid.UUID(payload.campaign_id)))
        campaign = result.scalar_one_or_none()
        if campaign:
            campaign.raised_amount = (campaign.raised_amount or 0) + payload.amount

    await db.flush()

    # Broadcast real-time event
    await manager.broadcast_all({
        "type": "new_donation",
        "data": {
            "id": str(donation.id),
            "amount": payload.amount,
            "currency": payload.currency,
            "donor_name": "Anonymous" if payload.is_anonymous else (payload.donor_name or "Supporter"),
            "campaign_id": payload.campaign_id,
            "created_at": donation.created_at.isoformat(),
        }
    })
    return {**donation_to_dict(donation), "transaction_id": txn_id}


@router.get("")
async def list_donations(
    campaign_id: Optional[str] = None, page: int = 1, limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    q = select(Donation).where(Donation.status == DonationStatus.COMPLETED)
    if campaign_id:
        q = q.where(Donation.campaign_id == uuid.UUID(campaign_id))
    total = await db.scalar(select(func.count()).select_from(q.subquery()))
    q = q.order_by(Donation.created_at.desc()).offset((page - 1) * limit).limit(limit)
    result = await db.execute(q)
    donations = result.scalars().all()
    return {"total": total, "data": [donation_to_dict(d) for d in donations]}


@router.get("/stats")
async def donation_stats(db: AsyncSession = Depends(get_db)):
    total = await db.scalar(select(func.sum(Donation.amount)).where(Donation.status == DonationStatus.COMPLETED)) or 0
    count = await db.scalar(select(func.count(Donation.id)).where(Donation.status == DonationStatus.COMPLETED)) or 0
    return {"total_raised": total, "total_donations": count, "currency": "INR"}


@router.post("/recurring", status_code=201)
async def create_recurring(
    payload: RecurringCreate, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user_optional),
):
    if not current_user:
        raise HTTPException(401, "Login required for recurring donations")
    r = RecurringDonation(
        id=uuid.uuid4(), donor_id=current_user.id,
        campaign_id=uuid.UUID(payload.campaign_id) if payload.campaign_id else None,
        amount=payload.amount, currency=payload.currency, frequency=payload.frequency,
    )
    db.add(r)
    await db.flush()
    return {"id": str(r.id), "amount": r.amount, "frequency": r.frequency, "status": "active"}
