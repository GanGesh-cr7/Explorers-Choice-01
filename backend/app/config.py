"""Application configuration loaded from environment variables."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/explorers_choice"

    # Admin API protection. A simple shared secret used by the admin UI to
    # authenticate admin operations. Supports `X-ADMIN-KEY` header.
    admin_api_key: str = "change-me-admin-key"

    # Security used to sign customer session tokens. MUST be overridden in
    # production with a long random value kept secret from the frontend.
    secret_key: str = "change-me-customer-secret"
    access_token_expire_minutes: int = 60 * 24  # 24h, extended via refresh at /auth/me
    cookie_secure: bool = False

    # CORS origins — the frontend dev server
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3100"]


settings = Settings()
