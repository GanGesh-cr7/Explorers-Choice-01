"""Main FastAPI application for Explorers Choice."""
import logging
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from .config import settings
from .database import Base, engine, SessionLocal
from . import models

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("explorers")
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
async def integrity_error_handler(request: Request, exc: IntegrityError):
    """FK/unique violations surface as 409 instead of a raw 500."""
    logger.warning("IntegrityError on %s %s: %s", request.method, request.url.path, exc.orig)
    return JSONResponse(
        status_code=409,
        content={"detail": "This record is referenced by other data and cannot be deleted or duplicated."},
    )


@app.middleware("http")
async def request_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start = time.monotonic()
    response = await call_next(request)
    elapsed_ms = round((time.monotonic() - start) * 1000, 1)
    logger.info(
        "%s %s -> %s (%sms, id=%s)",
        request.method, request.url.path, response.status_code, elapsed_ms, request_id,
    )
    response.headers["X-Request-ID"] = request_id
    return response

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
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception as exc:
        logger.error("Health check failed: %s", exc)
        return JSONResponse(status_code=503, content={"status": "error", "detail": "Database unreachable"})