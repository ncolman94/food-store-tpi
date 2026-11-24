from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Sin valor por defecto: si falta en el .env la app no arranca
    DATABASE_URL: str
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @field_validator("DATABASE_URL")
    @classmethod
    def usar_psycopg2(cls, url: str) -> str:
        # SQLAlchemy 2.1 usa psycopg 3 con postgresql://; el proyecto instala psycopg2
        for prefijo in ("postgresql://", "postgres://"):
            if url.startswith(prefijo):
                return "postgresql+psycopg2://" + url[len(prefijo):]
        return url


settings = Settings()  # type: ignore[call-arg]
