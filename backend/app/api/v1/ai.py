from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional, List
from app.core.database import get_db
from app.core.deps import get_current_user_optional
from app.models.user import User
from app.core.config import settings
import uuid, json, asyncio

router = APIRouter(prefix="/ai", tags=["AI Chatbot"])

SYSTEM_PROMPT = """You are Saarthi, the AI assistant for Samarpan — an Indian NGO platform dedicated to humanitarian impact.
You help users with:
- Donation guidance and campaign recommendations
- Volunteer registration and skill matching
- NGO transparency and fund utilization questions
- Emergency response information
- Event information and registration
- FAQ about Samarpan's mission and impact

Be warm, empathetic, and encouraging. Keep responses concise and actionable.
If asked in Hindi or Bengali, respond in the same language.
Always end with a call to action when appropriate."""


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    session_id: Optional[str] = None
    language: str = "en"
    stream: bool = True


@router.post("/chat")
async def chat(payload: ChatRequest, db: AsyncSession = Depends(get_db)):
    if not settings.GROQ_API_KEY:
        return {
            "response": "I'm Saarthi, your Samarpan assistant! Currently AI is being configured. Please explore our campaigns and donate to make an impact!",
            "session_id": str(uuid.uuid4()),
        }

    from groq import Groq
    client = Groq(api_key=settings.GROQ_API_KEY)

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in payload.messages[-10:]:  # context window of last 10 messages
        messages.append({"role": msg.role, "content": msg.content})

    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=messages,
        max_tokens=500,
        temperature=0.7,
    )
    reply = response.choices[0].message.content
    return {"response": reply, "session_id": payload.session_id or str(uuid.uuid4())}


@router.post("/recommend")
async def get_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    """AI-powered campaign and volunteer opportunity recommendations"""
    if not settings.GROQ_API_KEY:
        return {
            "campaigns": ["Education for All", "Flood Relief 2025", "Tree Plantation Drive"],
            "events": ["Community Health Camp", "Digital Literacy Workshop"],
            "message": "Here are some impactful opportunities for you!"
        }

    from groq import Groq
    client = Groq(api_key=settings.GROQ_API_KEY)
    context = f"User: {current_user.full_name if current_user else 'Guest'}"
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": "You are a recommendation engine for an NGO platform. Return JSON with campaign and event suggestions."},
            {"role": "user", "content": f"Recommend 3 campaigns and 2 events for: {context}. Return JSON: {{campaigns: [], events: [], message: ''}}"}
        ],
        max_tokens=300,
    )
    try:
        data = json.loads(response.choices[0].message.content)
        return data
    except Exception:
        return {"campaigns": [], "events": [], "message": response.choices[0].message.content}


@router.get("/summary/{entity_type}/{entity_id}")
async def ai_summary(entity_type: str, entity_id: str):
    """Generate AI summary for blogs/campaigns"""
    if not settings.GROQ_API_KEY:
        return {"summary": "This is an important initiative making real difference in communities."}

    from groq import Groq
    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[{"role": "user", "content": f"Write a 2-sentence compelling summary for a {entity_type} with id {entity_id} on an NGO platform."}],
        max_tokens=150,
    )
    return {"summary": response.choices[0].message.content}
