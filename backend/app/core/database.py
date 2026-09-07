from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool
from app.core.config import settings

db_url = settings.normalized_database_url

if "sqlite" in db_url:
    engine = create_async_engine(
        db_url,
        echo=False,
    )
else:
    engine = create_async_engine(
        db_url,
        echo=False,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        pool_recycle=1800,
    )

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

