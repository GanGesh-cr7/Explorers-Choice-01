"""Customer authentication: password hashing, JWT session issuance, and FastAPI dependencies.

Sessions are delivered as HttpOnly cookies so tokens are never exposed to
browser JavaScript (XSS-safe). A single stateless access token is used for the
customer API; token freshness is validated on every protected request.
"""
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, Request, status
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .config import settings
from .database import get_db
from . import crud, models

COOKIE_NAME = "ec_session"
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8")[:72], password_hash.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(user_id: int) -> str:
    expires = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": str(user_id), "exp": expires, "iat": datetime.now(timezone.utc)}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def _decode_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return int(payload.get("sub"))
    except (JWTError, TypeError, ValueError):
        return None


def get_current_user(
    request: Request, db: Session = Depends(get_db)
) -> models.User:
    """Resolve the authenticated customer from the session cookie."""
    token = request.cookies.get(COOKIE_NAME)
    user_id = _decode_token(token) if token else None
    user = crud.get_user(db, user_id=user_id) if user_id is not None else None
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="You need to log in to continue.",
        )
    return user


def optional_current_user(
    request: Request, db: Session = Depends(get_db)
) -> models.User | None:
    """Resolve the customer if logged in, else None (used for guest bookings)."""
    token = request.cookies.get(COOKIE_NAME)
    user_id = _decode_token(token) if token else None
    user = crud.get_user(db, user_id=user_id) if user_id is not None else None
    if user is None or not user.is_active:
        return None
    return user
