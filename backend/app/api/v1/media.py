from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.media import MediaAsset
import uuid, os, aiofiles
from app.core.config import settings

router = APIRouter(prefix="/media", tags=["Media"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "application/pdf"}


@router.post("/upload", status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    category: str = "general",
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"File type {file.content_type} not allowed")
    if file.size and file.size > settings.MAX_FILE_SIZE:
        raise HTTPException(400, "File too large")

    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    filename = f"{uuid.uuid4().hex}.{ext}"
    upload_dir = os.path.join(settings.UPLOAD_DIR, category)
    os.makedirs(upload_dir, exist_ok=True)
    filepath = os.path.join(upload_dir, filename)

    async with aiofiles.open(filepath, "wb") as f:
        content = await file.read()
        await f.write(content)

    file_type = "image" if "image" in file.content_type else "video" if "video" in file.content_type else "pdf"
    asset = MediaAsset(
        id=uuid.uuid4(), uploader_id=current_user.id,
        filename=filename, original_filename=file.filename,
        file_url=f"/static/{category}/{filename}",
        file_type=file_type, mime_type=file.content_type,
        file_size=len(content), category=category,
    )
    db.add(asset)
    await db.flush()
    return {"id": str(asset.id), "url": asset.file_url, "filename": filename}
