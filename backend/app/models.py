"""SQLAlchemy models for the destination/package system.

Relationships:
  Destination 1───* Package
  Package     1───* ItineraryDay

Uses JSON (JSONB on PostgreSQL) for array/dict fields to keep the schema
flexible for travel content (highlights, galleries, inclusions, etc.).
"""
from datetime import datetime, timezone

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def json_column(default_factory: callable) -> Mapped[list]:
    """Helper for JSON columns defaulting to an empty list."""
    return mapped_column(JSON, default=default_factory)


class Destination(Base):
    __tablename__ = "destinations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True, nullable=False)
    country: Mapped[str] = mapped_column(String(120), nullable=False)
    region: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    short_description: Mapped[str] = mapped_column(Text, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    hero_image: Mapped[str] = mapped_column(String(500), default="")
    gallery: Mapped[list] = json_column(list)
    best_time: Mapped[str] = mapped_column(String(160), default="")
    recommended_duration: Mapped[str] = mapped_column(String(120), default="")
    highlights: Mapped[list] = json_column(list)
    things_to_do: Mapped[list] = json_column(list)
    travel_information: Mapped[list] = json_column(list)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    packages: Mapped[list["Package"]] = relationship(
        back_populates="destination",
        cascade="all, delete-orphan",
        order_by="Package.name",
    )


class Package(Base):
    __tablename__ = "packages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    destination_id: Mapped[int] = mapped_column(
        ForeignKey("destinations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True, nullable=False)
    short_description: Mapped[str] = mapped_column(Text, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    duration_days: Mapped[int] = mapped_column(Integer, default=0)
    duration_nights: Mapped[int] = mapped_column(Integer, default=0)
    starting_price: Mapped[float] = mapped_column(Numeric(12, 2), default=0)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    hero_image: Mapped[str] = mapped_column(String(500), default="")
    gallery: Mapped[list] = json_column(list)
    highlights: Mapped[list] = json_column(list)
    included: Mapped[list] = json_column(list)
    excluded: Mapped[list] = json_column(list)
    accommodation_summary: Mapped[str] = mapped_column(Text, default="")
    transportation_summary: Mapped[str] = mapped_column(Text, default="")
    meal_summary: Mapped[str] = mapped_column(Text, default="")
    cancellation_policy: Mapped[str] = mapped_column(Text, default="")
    important_information: Mapped[list] = json_column(list)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    destination: Mapped["Destination"] = relationship(back_populates="packages")
    itinerary: Mapped[list["ItineraryDay"]] = relationship(
        back_populates="package",
        cascade="all, delete-orphan",
        order_by="ItineraryDay.day_number",
    )


class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    package_id: Mapped[int] = mapped_column(
        ForeignKey("packages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    day_number: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[str] = mapped_column(String(240), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    activities: Mapped[list] = json_column(list)
    meals: Mapped[str] = mapped_column(String(160), default="")
    accommodation: Mapped[str] = mapped_column(String(240), default="")
    transportation: Mapped[str] = mapped_column(String(240), default="")

    package: Mapped["Package"] = relationship(back_populates="itinerary")


class PackageFaq(Base):
    """Optional FAQ entries attached to a package (shown on package page)."""

    __tablename__ = "package_faqs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    package_id: Mapped[int] = mapped_column(
        ForeignKey("packages.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question: Mapped[str] = mapped_column(String(320), nullable=False)
    answer: Mapped[str] = mapped_column(Text, default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    package: Mapped["Package"] = relationship(back_populates="faqs")


Package.faqs = relationship(
    "PackageFaq",
    back_populates="package",
    cascade="all, delete-orphan",
    order_by="PackageFaq.sort_order",
)
