"""Admin-only authentication for management endpoints.

Admin operations are protected with a simple shared-secret header
(`X-Admin-Key`). In a production deployment this should be replaced with
real authentication (JWT + roles). Public read endpoints are unaffected.
"""
import hmac
import secrets

from fastapi import Header, HTTPException, status

from .config import settings


def _matches(provided: str, expected: str) -> bool:
    return hmac.compare_digest(provided.encode(), expected.encode())


def require_admin(x_admin_key: str = Header(default="")) -> None:
    if not settings.admin_api_key or settings.admin_api_key == "change-me-admin-key":
        # Fail closed if no key is configured rather than silently opening admin.
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Admin API key is not configured.",
        )
    if not x_admin_key or not _matches(x_admin_key, settings.admin_api_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing admin key.",
        )


def generate_admin_key() -> str:
    """Generate a strong random admin key (for initial setup)."""
    return secrets.token_urlsafe(32)