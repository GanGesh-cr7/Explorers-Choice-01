"""Main FastAPI application for Explorers Choice."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from .config import settings
from .database import Base, engine
from . import models
from .routes import account as account_router
from .routes import admin as admin_router
from .routes import auth as auth_router
from .routes import bookings as bookings_router
from .routes import destinations as destinations_router
from .routes import packages as packages_router

app = FastAPI(
    title="Explorers Choice API",
    description="Destination, package, itinerary, booking and account management for Explorers Choice.",
    version="2.0.0",
)

if settings.database_url.startswith("sqlite"):
    Base.metadata.create_all(bind=engine)


@app.exception_handler(IntegrityError)
async def integrity_error_handler(request, exc):
    """FK/unique violations surface as 409 instead of a raw 500."""
    return JSONResponse(
        status_code=409,
        content={"detail": "This record is referenced by other data and cannot be deleted or duplicated."},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(destinations_router.router, prefix="/api/destinations", tags=["destinations"])
app.include_router(packages_router.router, prefix="/api/packages", tags=["packages"])
app.include_router(bookings_router.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(auth_router.router, prefix="/api/auth", tags=["auth"])
app.include_router(account_router.router, prefix="/api/account", tags=["account"])
app.include_router(destinations_router.admin_router, prefix="/api/admin", tags=["admin destinations"])
app.include_router(packages_router.admin_router, prefix="/api/admin", tags=["admin packages"])
app.include_router(bookings_router.admin_router, prefix="/api/admin", tags=["admin bookings"])
app.include_router(admin_router.router, prefix="/api/admin", tags=["admin operations"])


@app.get("/api/health", tags=["system"])
def health():
    return {"status": "ok"}