from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl
from typing import List, Optional
import secrets


class Settings(BaseSettings):
    APP_NAME: str = "Samarpan NGO Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/samarpan"
    SYNC_DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/samarpan"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://samarpan.org",
    ]

    # Groq AI
    GROQ_API_KEY: str = ""

    # Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM: str = "noreply@samarpan.org"

    # File Storage
    UPLOAD_DIR: str = "./uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
