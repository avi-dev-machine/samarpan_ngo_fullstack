from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base
from app.websockets.manager import manager
import os

# Import all models to ensure they're registered
from app.models import *  # noqa


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("Database connected and tables created.")
    except Exception as e:
        print(f"Warning: Could not connect to database during startup. {e}")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Enterprise-grade AI-powered NGO ecosystem platform",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
os.makedirs("./uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="./uploads"), name="static")

# Include routers
from app.api.v1 import auth, campaigns, donations, volunteers, events, forum, ai, emergency, analytics, search, blogs, notifications, media, transparency

app.include_router(auth.router, prefix="/api/v1")
app.include_router(campaigns.router, prefix="/api/v1")
app.include_router(donations.router, prefix="/api/v1")
app.include_router(volunteers.router, prefix="/api/v1")
app.include_router(events.router, prefix="/api/v1")
app.include_router(forum.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(emergency.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(search.router, prefix="/api/v1")
app.include_router(blogs.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(media.router, prefix="/api/v1")
app.include_router(transparency.router, prefix="/api/v1")


# WebSocket endpoint
@app.websocket("/ws/{room}")
async def websocket_endpoint(websocket: WebSocket, room: str = "global"):
    await manager.connect(websocket, room)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast({"type": "message", "room": room, "data": data}, room)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": settings.APP_VERSION, "app": settings.APP_NAME}


@app.get("/")
async def root():
    return {"message": f"Welcome to {settings.APP_NAME} API", "docs": "/api/docs"}
