"""Application configuration loaded from environment variables."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/explorers_choice"

    # Admin API protection. A simple shared secret used by the admin UI to
    # authenticate admin operations. Supports `X-ADMIN-KEY` header.
    admin_api_key: str = "change-me-admin-key"

    # CORS origins — the frontend dev server
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3100"]


settings = Settings()
