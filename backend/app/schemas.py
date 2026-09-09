"""Pydantic schemas for the destination/package system."""
from datetime import date, datetime
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
    booking_mode: str = Field(default="REQUEST_ONLY", pattern=r"^(REQUEST_ONLY|INSTANT_BOOKING)$")
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
    booking_mode: Optional[str] = Field(default=None, pattern=r"^(REQUEST_ONLY|INSTANT_BOOKING)$")
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


# ---------------------------------------------------------------------------
# Booking schemas
# ---------------------------------------------------------------------------
class BookingCreate(BaseModel):
    package_slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$", max_length=220)
    travel_date: date
    adults: int = Field(ge=1, le=20)
    children: int = Field(default=0, ge=0, le=20)
    infants: int = Field(default=0, ge=0, le=10)
    departure_information: str = Field(default="", max_length=1000)
    full_name: str = Field(min_length=2, max_length=160)
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=254)
    phone: str = Field(min_length=5, max_length=60)
    country: str = Field(min_length=2, max_length=120)
    special_requirements: str = Field(default="", max_length=4000)
    notes: str = Field(default="", max_length=4000)


class BookingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    booking_reference: str
    package_name: str
    destination_name: str
    travel_date: date
    adults: int
    children: int
    infants: int
    subtotal: float
    taxes: float
    total: float
    currency: str
    status: str
    payment_status: str
    booking_mode: str
    created_at: datetime


class BookingStatusUpdate(BaseModel):
    status: str = Field(pattern=r"^(PENDING|PENDING_CONFIRMATION|CONFIRMED|PAYMENT_PENDING|PARTIALLY_PAID|PAID|CANCELLED|COMPLETED)$")
    payment_status: Optional[str] = Field(default=None, pattern=r"^(NOT_REQUIRED|PENDING|PARTIALLY_PAID|PAID|FAILED|REFUNDED)$")


class BookingDetail(BaseModel):
    """Authorized owner/admin view of a single booking."""

    model_config = ConfigDict(from_attributes=True)

    booking_reference: str
    package_id: int
    package_name: str
    destination_name: str
    duration_days: int
    travel_date: date
    adults: int
    children: int
    infants: int
    departure_information: str
    country: str
    special_requirements: str
    notes: str
    subtotal: float
    taxes: float
    total: float
    currency: str
    status: str
    payment_status: str
    booking_mode: str
    created_at: datetime
    updated_at: datetime
    payments: list["PaymentRead"] = []
    documents: list["DocumentRead"] = []


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    amount: float
    currency: str
    status: str
    provider_reference: str
    created_at: datetime


class DocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    document_type: str
    title: str
    file_name: str
    created_at: datetime


# ---------------------------------------------------------------------------
# Customer authentication + profile
# ---------------------------------------------------------------------------
class UserCreate(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=254)
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=160)
    phone: str = Field(default="", max_length=60)
    country: str = Field(default="", max_length=120)


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    phone: str
    country: str
    created_at: datetime


class LoginRequest(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=254)
    password: str = Field(min_length=1, max_length=128)


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, min_length=2, max_length=160)
    phone: Optional[str] = Field(default=None, max_length=60)
    country: Optional[str] = Field(default=None, max_length=120)


class ForgotPasswordRequest(BaseModel):
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=254)


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=1, max_length=300)
    password: str = Field(min_length=8, max_length=128)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


BookingDetail.model_rebuild()
