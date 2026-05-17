from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.volunteer import Volunteer, VolunteerSkill, VolunteerBadge
from app.models.user import User, UserRoleEnum
from groq import Groq
from app.core.config import settings
import uuid

router = APIRouter(prefix="/volunteers", tags=["Volunteers"])


class VolunteerRegister(BaseModel):
    skills: List[str] = []
    availability: dict = {}


class SkillAdd(BaseModel):
    skill: str
    level: str = "beginner"


@router.post("/register", status_code=201)
async def register_volunteer(
    payload: VolunteerRegister,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = await db.execute(select(Volunteer).where(Volunteer.user_id == current_user.id))
    if existing.scalar_one_or_none():
        raise HTTPException(400, "Already registered as volunteer")
    v = Volunteer(id=uuid.uuid4(), user_id=current_user.id, availability=payload.availability)
    db.add(v)
    await db.flush()
    for skill in payload.skills:
        db.add(VolunteerSkill(id=uuid.uuid4(), volunteer_id=v.id, skill=skill))
    return {"id": str(v.id), "status": "registered"}


@router.get("/me")
async def get_volunteer_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Volunteer).where(Volunteer.user_id == current_user.id))
    v = result.scalar_one_or_none()
    if not v:
        raise HTTPException(404, "Not registered as volunteer")
    skills_result = await db.execute(select(VolunteerSkill).where(VolunteerSkill.volunteer_id == v.id))
    skills = skills_result.scalars().all()
    badges_result = await db.execute(select(VolunteerBadge).where(VolunteerBadge.volunteer_id == v.id))
    badges = badges_result.scalars().all()
    return {
        "id": str(v.id), "is_verified": v.is_verified,
        "verification_status": v.verification_status,
        "total_hours": v.total_hours, "reputation_points": v.reputation_points,
        "skills": [{"skill": s.skill, "level": s.level} for s in skills],
        "badges": [{"name": b.badge_name, "icon": b.badge_icon} for b in badges],
        "availability": v.availability,
    }


@router.get("/leaderboard")
async def volunteer_leaderboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Volunteer, User)
        .join(User, Volunteer.user_id == User.id)
        .order_by(Volunteer.total_hours.desc())
        .limit(10)
    )
    rows = result.all()
    return [
        {"rank": i + 1, "name": u.full_name, "hours": v.total_hours, "points": v.reputation_points}
        for i, (v, u) in enumerate(rows)
    ]


@router.get("/ai-match")
async def ai_volunteer_match(
    campaign_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """AI-powered volunteer matching using Groq"""
    result = await db.execute(select(Volunteer).where(Volunteer.user_id == current_user.id))
    v = result.scalar_one_or_none()
    if not v:
        return {"match_score": 0, "recommendation": "Please register as a volunteer first."}

    skills_result = await db.execute(select(VolunteerSkill).where(VolunteerSkill.volunteer_id == v.id))
    skills = [s.skill for s in skills_result.scalars().all()]

    if not settings.GROQ_API_KEY:
        return {"match_score": 85, "recommendation": "You are a great match for this campaign based on your profile!"}

    client = Groq(api_key=settings.GROQ_API_KEY)
    prompt = f"A volunteer has skills: {', '.join(skills)}. Rate their suitability for campaign {campaign_id} from 0-100 and give a one-sentence recommendation. Reply in JSON: {{score: int, recommendation: str}}"
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=100,
    )
    import json
    try:
        data = json.loads(response.choices[0].message.content)
        return {"match_score": data.get("score", 80), "recommendation": data.get("recommendation", "")}
    except Exception:
        return {"match_score": 80, "recommendation": response.choices[0].message.content}
