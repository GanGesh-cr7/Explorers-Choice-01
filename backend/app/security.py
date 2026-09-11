"""Customer authentication: password hashing, JWT session issuance, and FastAPI dependencies.

Sessions are delivered as HttpOnly cookies so tokens are never exposed to
browser JavaScript (XSS-safe). A single stateless access token is used for the
customer API; token freshness is validated on every protected request.
"""
from datetime import datetime, timedelta, timezone
import time
from collections import deque

import bcrypt
from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from . import crud, models

COOKIE_NAME = "ec_session"
ALGORITHM = "HS256"

# Simple in-memory sliding-window rate limiter. Sufficient for a single
# process deployment; swap for a shared store (Redis) when running multiple
# workers. Buckets are keyed by client IP + label.
_rate_buckets: dict[tuple[str, str], deque[float]] = {}


def rate_limit(label: str, limit: int, window_seconds: int = 900):
    """Sliding-window rate limit for auth endpoints (brute-force protection)."""

    def dependency(request: Request) -> None:
        client_key = request.client.host if request.client else ""
        bucket_key = (client_key, label)
        now = time.monotonic()
        bucket = _rate_buckets.setdefault(bucket_key, deque())
        while bucket and bucket[0] <= now - window_seconds:
            bucket.popleft()
        if len(bucket) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many attempts. Please try again in a few minutes.",
            )
        bucket.append(now)

    return dependency


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8")[:72], password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(user_id: int, token_version: int = 0) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": str(user_id),
        "tv": token_version,
        "exp": expires,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def _decode_token(token: str) -> tuple[int | None, int | None]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub")) if payload.get("sub") is not None else None
        token_version = int(payload.get("tv") or 0)
        return user_id, token_version
    except (JWTError, TypeError, ValueError):
        return None, None


def _resolve_token_user(request: Request, db: Session) -> models.User | None:
    """Decode the cookie token and reject stale sessions after password change."""
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    user_id, token_version = _decode_token(token)
    if user_id is None:
        return None
    user = crud.get_user(db, user_id=user_id)
    if user is None or not user.is_active:
        return None
    if token_version != (user.token_version or 0):
        return None
    return user


def get_current_user(
    request: Request, db: Session = Depends(get_db)
) -> models.User:
    """Resolve the authenticated customer from the session cookie."""
    user = _resolve_token_user(request, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to log in to continue.",
        )
    return user


def optional_current_user(
    request: Request, db: Session = Depends(get_db)
) -> models.User | None:
    """Resolve the customer if logged in, else None (used for guest bookings)."""
    user = _resolve_token_user(request, db)
    return user


# ---------------------------------------------------------------------------
# Staff / role-based access control
# ---------------------------------------------------------------------------
STAFF_ROLES = {"TRAVEL_AGENT", "MANAGER", "ACCOUNTANT", "ADMIN"}


def _resolve_staff(request: Request, db: Session) -> models.User:
    """Resolve a logged-in staff member or raise 401/403."""
    user = _resolve_token_user(request, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to log in to continue.",
        )
    if user.role not in STAFF_ROLES or not user.is_staff:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access the operations area.",
        )
    return user


def require_admin(request: Request, db: Session = Depends(get_db)) -> models.User:
    """Any staff member (TRAVEL_AGENT, MANAGER, ACCOUNTANT, ADMIN)."""
    return _resolve_staff(request, db)


def require_roles(*roles: str):
    """Dependency factory requiring one or more specific roles."""

    def dependency(request: Request, db: Session = Depends(get_db)) -> models.User:
        user = _resolve_staff(request, db)
        if user.role not in set(roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return user

    return dependency


def require_hotel_owner(request: Request, db: Session = Depends(get_db)) -> models.User:
    """Hotel-owner only dependency (self-registered, not part of staff)."""
    user = _resolve_token_user(request, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to log in to continue.",
        )
    if user.role != "HOTEL_OWNER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to manage hotels.",
        )
    return user
