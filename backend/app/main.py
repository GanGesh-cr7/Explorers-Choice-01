"""Main FastAPI application for Explorers Choice."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .database import Base, engine
from .routes import destinations as destinations_router
from .routes import packages as packages_router

# Create tables on startup (idempotent). For schema changes use Alembic migrations.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Explorers Choice API",
    description="Destination, package and itinerary management for Explorers Choice.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(destinations_router.router, prefix="/api/destinations", tags=["destinations"])
app.include_router(packages_router.router, prefix="/api/packages", tags=["packages"])
app.include_router(destinations_router.admin_router, prefix="/api/admin", tags=["admin destinations"])
app.include_router(packages_router.admin_router, prefix="/api/admin", tags=["admin packages"])


@app.get("/api/health", tags=["system"])
def health():
    return {"status": "ok"}