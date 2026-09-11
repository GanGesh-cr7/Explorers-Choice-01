"""SQLAlchemy database setup and session management."""
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import BACKEND_DIR, settings


def _resolve_sqlite_url(url: str) -> str:
    """Anchor any relative SQLite path to the backend directory.

    This guarantees the whole login system uses one shared database file
    regardless of the process working directory (or an explicit relative
    DATABASE_URL like ``sqlite:///./explorers_choice.db``). Absolute paths
    and in-memory databases are left untouched.
    """
    if not url.startswith("sqlite:///"):
        return url
    rest = url[len("sqlite:///"):]
    if rest == "" or rest == ":memory:" or rest.startswith("/"):
        return url
    return f"sqlite:///{BACKEND_DIR / rest}"


engine_options = {"connect_args": {"check_same_thread": False}} if settings.database_url.startswith("sqlite") else {
    "pool_size": 10,
    "max_overflow": 20,
    "pool_timeout": 30,
    "pool_recycle": 1800,
}
engine = create_engine(
    _resolve_sqlite_url(settings.database_url), pool_pre_ping=True, future=True, **engine_options
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
