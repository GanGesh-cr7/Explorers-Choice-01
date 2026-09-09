"""Pydantic schemas for the destination/package system."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------------------------
# Destination schemas
# ---------------------------------------------------------------------------
class DestinationBase(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=180)
    country: str = Field(min_length=1, max_length=120)
    region: str = ""
    short_description: str = ""
    description: str = ""
    hero_image: str = ""
    gallery: list[str] = []
    best_time: str = ""
    recommended_duration: str = ""
    highlights: list[str] = []
    things_to_do: list[str] = []
    travel_information: list[str] = []
    is_featured: bool = False
    is_active: bool = True


class DestinationCreate(DestinationBase):
    pass


class DestinationUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=160)
    slug: Optional[str] = Field(default=None, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=180)
    country: Optional[str] = Field(default=None, min_length=1, max_length=120)
    region: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    hero_image: Optional[str] = None
    gallery: Optional[list[str]] = None
    best_time: Optional[str] = None
    recommended_duration: Optional[str] = None
    highlights: Optional[list[str]] = None
    things_to_do: Optional[list[str]] = None
    travel_information: Optional[list[str]] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


class DestinationRead(DestinationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Itinerary day schemas
# ---------------------------------------------------------------------------
class ItineraryDayBase(BaseModel):
    day_number: int = Field(ge=1)
    title: str = ""
    description: str = ""
    activities: list[str] = []
    meals: str = ""
    accommodation: str = ""
    transportation: str = ""


class ItineraryDayCreate(ItineraryDayBase):
    pass


class ItineraryDayUpdate(BaseModel):
    day_number: Optional[int] = Field(default=None, ge=1)
    title: Optional[str] = None
    description: Optional[str] = None
    activities: Optional[list[str]] = None
    meals: Optional[str] = None
    accommodation: Optional[str] = None
    transportation: Optional[str] = None


class ItineraryDayRead(ItineraryDayBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    package_id: int


# ---------------------------------------------------------------------------
# Package schemas
# ---------------------------------------------------------------------------
class PackageBase(BaseModel):
    destination_id: int
    name: str = Field(min_length=1, max_length=200)
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=220)
    short_description: str = ""
    description: str = ""
    duration_days: int = Field(ge=0, default=0)
    duration_nights: int = Field(ge=0, default=0)
    starting_price: float = Field(ge=0, default=0)
    currency: str = Field(default="USD", max_length=3)
    hero_image: str = ""
    gallery: list[str] = []
    highlights: list[str] = []
    included: list[str] = []
    excluded: list[str] = []
    accommodation_summary: str = ""
    transportation_summary: str = ""
    meal_summary: str = ""
    cancellation_policy: str = ""
    important_information: list[str] = []
    is_featured: bool = False
    is_active: bool = True


class PackageCreate(PackageBase):
    itinerary: list[ItineraryDayCreate] = []
    faqs: list["PackageFaqCreate"] = []


class PackageUpdate(BaseModel):
    destination_id: Optional[int] = None
    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    slug: Optional[str] = Field(default=None, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=220)
    short_description: Optional[str] = None
    description: Optional[str] = None
    duration_days: Optional[int] = Field(default=None, ge=0)
    duration_nights: Optional[int] = Field(default=None, ge=0)
    starting_price: Optional[float] = Field(default=None, ge=0)
    currency: Optional[str] = Field(default=None, max_length=3)
    hero_image: Optional[str] = None
    gallery: Optional[list[str]] = None
    highlights: Optional[list[str]] = None
    included: Optional[list[str]] = None
    excluded: Optional[list[str]] = None
    accommodation_summary: Optional[str] = None
    transportation_summary: Optional[str] = None
    meal_summary: Optional[str] = None
    cancellation_policy: Optional[str] = None
    important_information: Optional[list[str]] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


class PackageFaqBase(BaseModel):
    question: str = Field(min_length=1, max_length=320)
    answer: str = ""
    sort_order: int = 0


class PackageFaqCreate(PackageFaqBase):
    pass


class PackageFaqUpdate(BaseModel):
    question: Optional[str] = Field(default=None, min_length=1, max_length=320)
    answer: Optional[str] = None
    sort_order: Optional[int] = None


class PackageFaqRead(PackageFaqBase):
    model_config = ConfigDict(from_attributes=True)

    id: int


class PackageRead(PackageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    destination: Optional[DestinationRead] = None
    itinerary: list[ItineraryDayRead] = []
    faqs: list[PackageFaqRead] = []


class PackageSummary(PackageBase):
    """Lightweight package read for listing views (avoids heavy nested data)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
    destination: Optional[DestinationRead] = None


PackageCreate.model_rebuild()
