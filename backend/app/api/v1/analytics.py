from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import User, UserRoleEnum
from app.models.donation import Donation, DonationStatus
from app.models.campaign import Campaign
from app.models.volunteer import Volunteer
from app.models.event import Event, EventAttendee

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/overview")
async def analytics_overview(db: AsyncSession = Depends(get_db)):
    total_donations = await db.scalar(select(func.sum(Donation.amount)).where(Donation.status == DonationStatus.COMPLETED)) or 0
    total_donors = await db.scalar(select(func.count(func.distinct(Donation.donor_id))).where(Donation.status == DonationStatus.COMPLETED)) or 0
    total_campaigns = await db.scalar(select(func.count(Campaign.id)).where(Campaign.deleted_at.is_(None))) or 0
    total_volunteers = await db.scalar(select(func.count(Volunteer.id))) or 0
    total_events = await db.scalar(select(func.count(Event.id)).where(Event.is_published == True)) or 0
    total_users = await db.scalar(select(func.count(User.id)).where(User.deleted_at.is_(None))) or 0

    return {
        "total_raised": total_donations,
        "total_donors": total_donors,
        "active_campaigns": total_campaigns,
        "total_volunteers": total_volunteers,
        "total_events": total_events,
        "total_users": total_users,
        "countries_reached": 12,
        "beneficiaries_helped": 45000,
        "emergency_responses": 28,
    }


@router.get("/donations/trend")
async def donation_trend(db: AsyncSession = Depends(get_db)):
    """Monthly donation trend for the past 6 months"""
    from sqlalchemy import extract
    from datetime import datetime, timedelta
    months = []
    now = datetime.utcnow()
    for i in range(5, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=30 * i)).replace(day=1)
        month_num = month_start.month
        year_num = month_start.year
        total = await db.scalar(
            select(func.sum(Donation.amount)).where(
                Donation.status == DonationStatus.COMPLETED,
                extract("month", Donation.created_at) == month_num,
                extract("year", Donation.created_at) == year_num,
            )
        ) or 0
        months.append({
            "month": month_start.strftime("%b %Y"),
            "amount": total,
        })
    return months


@router.get("/campaigns/stats")
async def campaign_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Campaign.category, func.count(Campaign.id), func.sum(Campaign.raised_amount))
        .where(Campaign.deleted_at.is_(None))
        .group_by(Campaign.category)
    )
    rows = result.all()
    return [{"category": r[0] or "Other", "count": r[1], "raised": r[2] or 0} for r in rows]


@router.get("/transparency")
async def transparency_data(db: AsyncSession = Depends(get_db)):
    """Fund utilization breakdown"""
    return {
        "allocation": [
            {"category": "Direct Aid", "percentage": 60, "amount": 0},
            {"category": "Operations", "percentage": 15, "amount": 0},
            {"category": "Volunteer Programs", "percentage": 15, "amount": 0},
            {"category": "Technology", "percentage": 5, "amount": 0},
            {"category": "Admin", "percentage": 5, "amount": 0},
        ],
        "audit_status": "Verified",
        "last_audit": "March 2025",
    }
