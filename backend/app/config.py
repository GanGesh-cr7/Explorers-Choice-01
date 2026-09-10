"""Application configuration loaded from environment variables.

Secrets fail closed: the app refuses to start with the placeholder values
unless `EXPLORERS_ALLOW_INSECURE=true` is explicitly set for local development.
"""
from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str = "postgresql://postgres:postgres@localhost:5432/explorers_choice"

    # Shared secret used by the admin UI to authenticate admin operations
    # (`X-ADMIN-KEY` header). Keep in sync with the admin area deployment.
    admin_api_key: str = "change-me-admin-key"

    # Security used to sign customer session tokens. MUST be a long random
    # value kept secret from the frontend. Never ship the placeholder.
    secret_key: str = "change-me-customer-secret"
    access_token_expire_minutes: int = 60 * 24  # 24h

    # Session cookie flag. Keep True in production (HTTPS only).
    cookie_secure: bool = True

    # CORS origins — the frontend host(s)
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:3100"]

    # Local development escape hatch: allows the placeholder secrets above.
    allow_insecure_defaults: bool = Field(
        default=False,
        validation_alias=AliasChoices("EXPLORERS_ALLOW_INSECURE", "ALLOW_INSECURE_DEFAULTS"),
    )

    @model_validator(mode="after")
    def _guard_placeholder_secrets(self) -> "Settings":
        if (
            not self.secret_key
            or self.secret_key == "change-me-customer-secret"
            or self.secret_key.startswith("change-me")
        ):
            if not self.allow_insecure_defaults:
                raise ValueError(
                    "SECRET_KEY must be set to a strong random value. "
                    "For local development only, set EXPLORERS_ALLOW_INSECURE=true."
                )
        if not self.admin_api_key or self.admin_api_key == "change-me-admin-key":
            if not self.allow_insecure_defaults:
                raise ValueError(
                    "ADMIN_API_KEY must be set to a strong random value. "
                    "For local development only, set EXPLORERS_ALLOW_INSECURE=true."
                )
        return self


settings = Settings()