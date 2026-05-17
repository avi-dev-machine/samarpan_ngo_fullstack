from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user, require_role
from app.models.emergency import EmergencyAlert, SOSRequest
from app.models.user import User, UserRoleEnum
from app.websockets.manager import manager
import uuid

router = APIRouter(prefix="/emergency", tags=["Emergency"])


class SOSCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    description: str
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class AlertCreate(BaseModel):
    title: str
    description: str
    severity: str = "medium"
    location: Optional[str] = None


@router.post("/sos", status_code=201)
async def submit_sos(payload: SOSCreate, db: AsyncSession = Depends(get_db)):
    sos = SOSRequest(id=uuid.uuid4(), **payload.model_dump())
    db.add(sos)
    await db.flush()
    await manager.broadcast_all({
        "type": "sos_alert",
        "data": {"id": str(sos.id), "name": sos.name, "location": sos.location, "description": sos.description}
    })
    return {"id": str(sos.id), "status": "pending", "message": "SOS received. Help is on the way!"}


@router.get("/sos")
async def list_sos(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.MODERATOR)),
):
    result = await db.execute(select(SOSRequest).order_by(SOSRequest.created_at.desc()).limit(50))
    sos_list = result.scalars().all()
    return [{"id": str(s.id), "name": s.name, "status": s.status, "location": s.location, "created_at": s.created_at.isoformat()} for s in sos_list]


@router.post("/alerts", status_code=201)
async def create_alert(
    payload: AlertCreate, db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRoleEnum.SUPER_ADMIN)),
):
    alert = EmergencyAlert(id=uuid.uuid4(), created_by=current_user.id, **payload.model_dump())
    db.add(alert)
    await db.flush()
    await manager.broadcast_all({"type": "emergency_alert", "data": {"title": alert.title, "severity": alert.severity}})
    return {"id": str(alert.id), "title": alert.title}


@router.get("/alerts")
async def list_alerts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(EmergencyAlert).where(EmergencyAlert.is_active == True).order_by(EmergencyAlert.created_at.desc()).limit(20))
    alerts = result.scalars().all()
    return [{"id": str(a.id), "title": a.title, "description": a.description, "severity": a.severity, "location": a.location} for a in alerts]
