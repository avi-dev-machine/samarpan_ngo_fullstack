from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData
from app.core.config import settings

NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

# Graceful Fallback check for placeholders or unconfigured credentials
db_url = settings.DATABASE_URL
sync_db_url = settings.SYNC_DATABASE_URL

# Check if either URL contains placeholder characters
is_placeholder = (
    "<port>" in db_url or 
    "<user>" in db_url or 
    "<password>" in db_url or 
    "<dbname>" in db_url or
    "<host>" in db_url or
    "localhost:5432" in db_url  # Fallback in production space environments to maintain uptime
)

if is_placeholder:
    print("WARNING: Placeholder values or localhost detected in DATABASE_URL. Falling back to local SQLite database.")
    db_url = "sqlite+aiosqlite:///samarpan.db"
    sync_db_url = "sqlite:///samarpan.db"

# Also handle create_async_engine and create_engine parameters dynamically
is_sqlite = db_url.startswith("sqlite")

engine_kwargs = {
    "echo": settings.DEBUG,
}

if not is_sqlite:
    # Postgres specific optimization flags
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 20,
        "max_overflow": 0,
    })

engine = create_async_engine(db_url, **engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)


async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
