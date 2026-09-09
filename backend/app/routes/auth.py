"""Customer registration, login, session, profile and password management."""
import secrets

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from .. import crud, schemas, security
from ..database import get_db

router = APIRouter()


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=security.COOKIE_NAME,
        value=token,
        max_age=security.settings.access_token_expire_minutes * 60,
        httponly=True,
        secure=security.settings.cookie_secure,
        samesite="lax",
        path="/",
    )


def _clear_session_cookie(response: Response) -> None:
    response.delete_cookie(security.COOKIE_NAME, path="/")


@router.post("/register", response_model=schemas.UserRead, status_code=status.HTTP_201_CREATED)
def register(data: schemas.UserCreate, response: Response, db: Session = Depends(get_db)):
    email = data.email.strip().lower()
    if crud.get_user(db, email=email):
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    user = crud.create_user(db, data, security.hash_password(data.password))
    token = security.create_access_token(user.id)
    _set_session_cookie(response, token)
    return user


@router.post("/login", response_model=schemas.UserRead)
def login(data: schemas.LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = crud.get_user(db, email=data.email.strip().lower())
    if user is None or not user.is_active or not security.verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")
    token = security.create_access_token(user.id)
    _set_session_cookie(response, token)
    return user


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response):
    _clear_session_cookie(response)


@router.get("/me", response_model=schemas.UserRead)
def me(user=Depends(security.get_current_user)):
    return user


@router.patch("/me", response_model=schemas.UserRead)
def update_me(
    data: schemas.ProfileUpdate,
    user=Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    return crud.update_user(db, user, data)


@router.post("/forgot-password", status_code=status.HTTP_204_NO_CONTENT)
def forgot_password(data: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = crud.get_user(db, email=data.email.strip().lower())
    if user is None:
        # Do not reveal whether the email exists; always respond identically.
        return
    token = secrets.token_urlsafe(32)
    crud.create_password_reset(db, user, token)
    # In production this token is emailed. For local development, returning it
    # would be insecure, so we simply conclude silently.
    return


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
def reset_password(data: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    record = crud.get_valid_reset_token(db, data.token)
    if record is None:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired.")
    user = crud.get_user(db, user_id=record.user_id)
    if user is None:
        raise HTTPException(status_code=400, detail="This reset link is invalid or has expired.")
    crud.mark_reset_token_used(db, record)
    crud.set_user_password(db, user, security.hash_password(data.password))


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    data: schemas.ChangePasswordRequest,
    user=Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    if not security.verify_password(data.current_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Your current password is incorrect.")
    crud.set_user_password(db, user, security.hash_password(data.new_password))
