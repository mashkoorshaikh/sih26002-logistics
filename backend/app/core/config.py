import os
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ENV_PATH = os.path.join(BACKEND_DIR, ".env")

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./ner_logistics.db"
    SECRET_KEY: str = "ner-logistics-super-secret-key-change-in-production-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    ENVIRONMENT: str = "development"
    PORT: int = 8000

    @property
    def normalized_database_url(self) -> str:
        url = self.DATABASE_URL.strip()
        # Heroku/Render/Railway/Supabase/Neon standard postgres URL format conversion
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
            url = url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url

    @property
    def origins_list(self) -> list[str]:
        if not self.ALLOWED_ORIGINS or self.ALLOWED_ORIGINS.strip() == "*":
            return ["*"]
        return [o.strip().rstrip("/") for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]

    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() in ("production", "prod")

    def is_production_secret_set(self) -> bool:
        return bool(self.SECRET_KEY and self.SECRET_KEY != "ner-logistics-super-secret-key-change-in-production-2026")

    model_config = SettingsConfigDict(
        env_file=(ENV_PATH, ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

