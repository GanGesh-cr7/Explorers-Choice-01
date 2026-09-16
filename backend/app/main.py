"""Main FastAPI application for Explorers Choice."""
from contextlib import asynccontextmanager
import logging
from pathlib import Path
import time
import uuid

from alembic import command
from alembic.config import Config
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError

from .config import settings
from .database import Base, engine, SessionLocal
from . import models, security

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("explorers")
from .routes import account as account_router
from .routes import admin as admin_router
from .routes import auth as auth_router
from .routes import bookings as bookings_router
from .routes import destinations as destinations_router
from .routes import enquiries as enquiries_router
from .routes import hotels as hotels_router
from .routes import oauth as oauth_router
from .routes import packages as packages_router

def run_startup_migrations():
    """Ensure database schema is up-to-date with Alembic migrations on startup.

    BUG-09: migration failures now raise SystemExit so startup cannot continue
    against an outdated schema.
    """
    try:
        backend_dir = Path(__file__).resolve().parent.parent
        alembic_ini = backend_dir / "alembic.ini"
        if alembic_ini.exists():
            alembic_cfg = Config(str(alembic_ini))
            alembic_cfg.set_main_option("script_location", str(backend_dir / "app" / "migrations"))
            alembic_cfg.set_main_option("sqlalchemy.url", settings.database_url)
            command.upgrade(alembic_cfg, "head")
            logger.info("Database schema verified / upgraded to head successfully.")
        else:
            logger.warning("alembic.ini not found; cannot verify schema.")
    except Exception as exc:
        logger.critical("Database migration failed, refusing to start: %s", exc)
        raise SystemExit(1) from exc


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure migrations are applied
    if settings.database_url.startswith("sqlite"):
        Base.metadata.create_all(bind=engine)
    else:
        run_startup_migrations()
    yield
    # Shutdown


app = FastAPI(
    title="Explorers Choice API",
    description="Destination, package, itinerary, booking and account management for Explorers Choice.",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.docs_enabled else None,
    redoc_url="/redoc" if settings.docs_enabled else None,
    openapi_url="/openapi.json" if settings.docs_enabled else None,
)


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
    if request.url.path.startswith("/api"):
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
    logger.info(
        "%s %s -> %s (%sms, id=%s)",
        request.method, request.url.path, response.status_code, elapsed_ms, request_id,
    )
    response.headers["X-Request-ID"] = request_id
    return response


@app.middleware("http")
async def csrf_protection_middleware(request: Request, call_next):
    """CSRF guard for cookie-authenticated state-changing requests.

    If a request carries a session cookie and uses an unsafe method
    (POST, PUT, PATCH, DELETE), verify that Origin (or Referer)
    matches an allowed frontend origin.
    """
    if request.method in ("POST", "PUT", "PATCH", "DELETE"):
        has_session = security.COOKIE_NAME in request.cookies
        if has_session:
            origin = request.headers.get("origin") or request.headers.get("referer")
            if not security.is_allowed_origin(origin):
                logger.warning(
                    "CSRF blocked: %s %s with Origin=%s, Referer=%s",
                    request.method, request.url.path,
                    request.headers.get("origin"), request.headers.get("referer"),
                )
                return JSONResponse(
                    status_code=403,
                    content={"detail": "CSRF check failed: invalid or missing request origin."},
                )
    return await call_next(request)


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(destinations_router.router, prefix="/api/destinations", tags=["destinations"])
app.include_router(packages_router.router, prefix="/api/packages", tags=["packages"])
app.include_router(bookings_router.router, prefix="/api/bookings", tags=["bookings"])
app.include_router(auth_router.router, prefix="/api/auth", tags=["auth"])
app.include_router(oauth_router.router, prefix="/api/auth", tags=["auth"])
app.include_router(account_router.router, prefix="/api/account", tags=["account"])
app.include_router(hotels_router.router, prefix="/api/hotels", tags=["hotels"])
app.include_router(hotels_router.owner_router, prefix="/api/hotel-owner", tags=["hotel owner"])
app.include_router(hotels_router.admin_router, prefix="/api/admin", tags=["admin hotels"])
app.include_router(destinations_router.admin_router, prefix="/api/admin", tags=["admin destinations"])
app.include_router(packages_router.admin_router, prefix="/api/admin", tags=["admin packages"])
app.include_router(bookings_router.admin_router, prefix="/api/admin", tags=["admin bookings"])
app.include_router(admin_router.router, prefix="/api/admin", tags=["admin operations"])
app.include_router(enquiries_router.router, prefix="/api/enquiries", tags=["public enquiries"])

@app.get("/api/health", tags=["system"])
def health():
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        return {"status": "ok"}
    except Exception as exc:
        logger.error("Health check failed: %s", exc)
        return JSONResponse(status_code=503, content={"status": "error", "detail": "Database unreachable"})