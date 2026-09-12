"""Application configuration loaded from environment variables.

Secrets fail closed: the app refuses to start with the placeholder values
unless `EXPLORERS_ALLOW_INSECURE=true` is explicitly set for local development.
"""
from pydantic import AliasChoices, Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Local development uses one SQLite database file per developer. Set
    # DATABASE_URL later when switching this environment to shared PostgreSQL.
    database_url: str = "sqlite:///./explorers_choice.db"

    # Shared secret used by the admin UI to authenticate admin operations
    # (`X-ADMIN-KEY` header). Keep in sync with the admin area deployment.
    admin_api_key: str = "change-me-admin-key"

    # Security used to sign customer session tokens. MUST be a long random
    # value kept secret from the frontend. Never ship the placeholder.
    secret_key: str = "change-me-customer-secret"
    access_token_expire_minutes: int = 60 * 24  # 24h

    # Local development uses HTTP; production must set COOKIE_SECURE=true.
    cookie_secure: bool = False

    # Google OAuth (server-driven "Sign in with Google"). Leave blank to disable
    # the Google login flow entirely; the /api/auth/google endpoints then return 503.
    google_client_id: str = ""
    google_client_secret: str = ""
    # Callback route must exactly match the "Authorized redirect URIs" configured
    # in the Google Cloud Console OAuth client.
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"
    # Where the browser lands after a successful (or failed) Google sign-in.
    google_return_url: str = "http://localhost:3000"

    # Environment name: "development" | "production" | "staging"
    environment: str = Field(
        default="development",
        validation_alias=AliasChoices("ENVIRONMENT", "EXPLORERS_ENV"),
    )

    # API Documentation (Swagger UI /docs, ReDoc /redoc, OpenAPI /openapi.json)
    # Defaults to enabled in development, disabled in production unless DOCS_ENABLED=true.
    docs_enabled: bool | None = Field(
        default=None,
        validation_alias=AliasChoices("DOCS_ENABLED", "ENABLE_DOCS"),
    )

    # CORS origins — include both local hostnames used during development.
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://localhost:3100",
    ]

    # Allow browser origins served from any localhost or private-LAN address on
    # a dev port, so devices on the same network can log in against this backend.
    # Automatically disabled in production environment.
    cors_origin_regex: str | None = (
        r"http://(?:localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):\d{1,5}"
    )

    # Local development escape hatch: allows the placeholder secrets above.
    allow_insecure_defaults: bool = Field(
        default=False,
        validation_alias=AliasChoices("EXPLORERS_ALLOW_INSECURE", "ALLOW_INSECURE_DEFAULTS"),
    )

    @model_validator(mode="after")
    def _guard_placeholder_secrets(self) -> "Settings":
        if not self.database_url.strip():
            raise ValueError("DATABASE_URL must point to the shared application database.")
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

        # Default docs_enabled based on environment if not explicitly configured
        if self.docs_enabled is None:
            self.docs_enabled = self.environment.lower() not in ("production", "prod")

        # In production, disable LAN regex matching for CORS and enforce secure cookies
        if self.environment.lower() in ("production", "prod"):
            self.cors_origin_regex = None
            if not self.cookie_secure:
                raise ValueError(
                    "COOKIE_SECURE must be true in production to prevent cleartext session cookies."
                )
        return self


settings = Settings()