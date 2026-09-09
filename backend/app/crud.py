"""CRUD operations for destinations, packages, itineraries, users and bookings."""
from datetime import date, datetime, timedelta, timezone
import secrets

from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from . import models, schemas


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------
def get_user(db: Session, user_id: int | None = None, email: str | None = None) -> models.User | None:
    query = select(models.User)
    if user_id is not None:
        query = query.where(models.User.id == user_id)
    elif email is not None:
        query = query.where(models.User.email == email)
    else:
        return None
    return db.scalars(query).first()


def create_user(db: Session, data: schemas.UserCreate, password_hash: str) -> models.User:
    user = models.User(
        email=data.email.strip().lower(),
        password_hash=password_hash,
        full_name=data.full_name.strip(),
        phone=data.phone.strip(),
        country=data.country.strip(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: models.User, data: schemas.ProfileUpdate) -> models.User:
    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def create_password_reset(db: Session, user: models.User, token_hash: str) -> models.PasswordResetToken:
    record = models.PasswordResetToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
    )
    db.add(record)
    db.commit()
    return record


def get_valid_reset_token(db: Session, token_hash: str) -> models.PasswordResetToken | None:
    now = datetime.now(timezone.utc)
    return db.scalars(
        select(models.PasswordResetToken)
        .where(
            models.PasswordResetToken.token_hash == token_hash,
            models.PasswordResetToken.used_at.is_(None),
            models.PasswordResetToken.expires_at > now,
        )
    ).first()


def mark_reset_token_used(db: Session, record: models.PasswordResetToken) -> None:
    record.used_at = datetime.now(timezone.utc)
    db.commit()


def set_user_password(db: Session, user: models.User, password_hash: str) -> None:
    user.password_hash = password_hash
    db.commit()


# ---------------------------------------------------------------------------
# Destinations
# ---------------------------------------------------------------------------
def list_destinations(db: Session, *, active_only: bool = True, featured_only: bool = False):
    query = select(models.Destination).order_by(models.Destination.name)
    if active_only:
        query = query.where(models.Destination.is_active.is_(True))
    if featured_only:
        query = query.where(models.Destination.is_featured.is_(True))
    return db.scalars(query).all()


def get_destination(db: Session, destination_id: int | None = None, slug: str | None = None):
    query = select(models.Destination)
    if destination_id is not None:
        query = query.where(models.Destination.id == destination_id)
    elif slug is not None:
        query = query.where(models.Destination.slug == slug)
    else:
        return None
    return db.scalars(query).first()


def create_destination(db: Session, data: schemas.DestinationCreate) -> models.Destination:
    destination = models.Destination(**data.model_dump())
    db.add(destination)
    db.commit()
    db.refresh(destination)
    return destination


def update_destination(
    db: Session, destination: models.Destination, data: schemas.DestinationUpdate
) -> models.Destination:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(destination, field, value)
    db.commit()
    db.refresh(destination)
    return destination


def delete_destination(db: Session, destination: models.Destination, *, hard: bool = False) -> None:
    if hard:
        db.delete(destination)
        db.commit()
    else:
        destination.is_active = False
        db.commit()


# ---------------------------------------------------------------------------
# Packages
# ---------------------------------------------------------------------------
def _package_base_query():
    return select(models.Package).options(
        selectinload(models.Package.destination),
        selectinload(models.Package.itinerary),
        selectinload(models.Package.faqs),
    )


def list_packages(db: Session, *, active_only: bool = True, featured_only: bool = False):
    query = _package_base_query().order_by(models.Package.name)
    if active_only:
        query = query.where(models.Package.is_active.is_(True))
    if featured_only:
        query = query.where(models.Package.is_featured.is_(True))
    return db.scalars(query).unique().all()


def get_package(
    db: Session, package_id: int | None = None, slug: str | None = None
) -> models.Package | None:
    query = _package_base_query()
    if package_id is not None:
        query = query.where(models.Package.id == package_id)
    elif slug is not None:
        query = query.where(models.Package.slug == slug)
    else:
        return None
    return db.scalars(query).unique().first()


def get_packages_by_destination(db: Session, destination_id: int, *, active_only: bool = True):
    query = _package_base_query().where(models.Package.destination_id == destination_id)
    if active_only:
        query = query.where(models.Package.is_active.is_(True))
    return db.scalars(query).unique().all()


def create_package(db: Session, data: schemas.PackageCreate) -> models.Package:
    payload = data.model_dump(exclude={"itinerary", "faqs"})
    package = models.Package(**payload)
    package.itinerary = [
        models.ItineraryDay(**day.model_dump()) for day in data.itinerary
    ]
    package.faqs = [
        models.PackageFaq(**faq.model_dump()) for faq in data.faqs
    ]
    db.add(package)
    db.commit()
    return get_package(db, package_id=package.id)


def update_package(
    db: Session, package: models.Package, data: schemas.PackageUpdate
) -> models.Package:
    payload = data.model_dump(exclude_unset=True, exclude={"itinerary", "faqs"})
    for field, value in payload.items():
        setattr(package, field, value)
    db.commit()
    return get_package(db, package_id=package.id)


def delete_package(db: Session, package: models.Package, *, hard: bool = False) -> None:
    if hard:
        db.delete(package)
        db.commit()
    else:
        package.is_active = False
        db.commit()


def upsert_itinerary_days(
    db: Session, package: models.Package, days: list[schemas.ItineraryDayCreate]
) -> list[models.ItineraryDay]:
    """Replace all itinerary days for a package in one operation."""
    if days is None:
        return package.itinerary
    for existing in list(package.itinerary):
        db.delete(existing)
    db.flush()
    new_days = [models.ItineraryDay(**day.model_dump()) for day in days]
    package.itinerary = new_days
    db.commit()
    return get_package(db, package_id=package.id).itinerary


# ---------------------------------------------------------------------------
# Bookings
# ---------------------------------------------------------------------------
def generate_booking_reference(db: Session) -> str:
    """Generate a public, non-sequential booking reference."""
    while True:
        reference = f"EC-{date.today().year}-{secrets.token_hex(3).upper()}"
        exists = db.scalar(select(models.Booking.id).where(models.Booking.booking_reference == reference))
        if exists is None:
            return reference


def create_booking(
    db: Session, data: schemas.BookingCreate, user_id: int | None = None
) -> models.Booking | None:
    package = get_package(db, slug=data.package_slug)
    if package is None or not package.is_active or not package.destination.is_active:
        return None

    subtotal = round(float(package.starting_price) * (data.adults + data.children), 2)
    taxes = 0.0
    booking_mode = package.booking_mode
    status = "PAYMENT_PENDING" if booking_mode == "INSTANT_BOOKING" else "PENDING_CONFIRMATION"
    payment_status = "PENDING" if booking_mode == "INSTANT_BOOKING" else "NOT_REQUIRED"
    booking = models.Booking(
        booking_reference=generate_booking_reference(db),
        user_id=user_id,
        package_id=package.id,
        travel_date=data.travel_date,
        adults=data.adults,
        children=data.children,
        infants=data.infants,
        departure_information=data.departure_information.strip(),
        full_name=(data.full_name or "").strip(),
        email=(data.email or "").strip().lower(),
        phone=(data.phone or "").strip(),
        country=(data.country or "").strip(),
        special_requirements=data.special_requirements.strip(),
        notes=data.notes.strip(),
        subtotal=subtotal,
        taxes=taxes,
        total=round(subtotal + taxes, 2),
        currency=package.currency.upper(),
        status=status,
        payment_status=payment_status,
        package_name=package.name,
        destination_name=package.destination.name,
        duration_days=package.duration_days,
        booking_mode=booking_mode,
    )
    booking.travellers = [
        models.BookingTraveller(traveller_type="ADULT", quantity=data.adults),
        models.BookingTraveller(traveller_type="CHILD", quantity=data.children),
        models.BookingTraveller(traveller_type="INFANT", quantity=data.infants),
    ]
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


def list_bookings(
    db: Session, *, user_id: int | None = None, admin_view: bool = False, booking_status: str | None = None
) -> list[models.Booking]:
    query = select(models.Booking).order_by(models.Booking.travel_date.asc(), models.Booking.created_at.desc())
    if admin_view:
        if booking_status:
            query = query.where(models.Booking.status == booking_status)
    elif user_id is not None:
        query = query.where(models.Booking.user_id == user_id)
    return db.scalars(query).all()


def get_booking(db: Session, booking_id: int) -> models.Booking | None:
    return db.get(models.Booking, booking_id)


def update_booking_status(
    db: Session, booking: models.Booking, data: schemas.BookingStatusUpdate
) -> models.Booking:
    booking.status = data.status
    if data.payment_status is not None:
        booking.payment_status = data.payment_status
    db.commit()
    db.refresh(booking)
    return booking


# ---------------------------------------------------------------------------
# Payments
# ---------------------------------------------------------------------------
def list_payments(db: Session, booking_id: int) -> list[models.Payment]:
    return db.scalars(select(models.Payment).where(models.Payment.booking_id == booking_id).order_by(models.Payment.created_at.asc())).all()


# ---------------------------------------------------------------------------
# Documents
# ---------------------------------------------------------------------------
def list_documents(db: Session, booking_id: int) -> list[models.BookingDocument]:
    return db.scalars(
        select(models.BookingDocument).where(models.BookingDocument.booking_id == booking_id).order_by(models.BookingDocument.created_at.desc())
    ).all()


def get_document(db: Session, document_id: int, *, booking_id: int | None = None) -> models.BookingDocument | None:
    query = select(models.BookingDocument).where(models.BookingDocument.id == document_id)
    if booking_id is not None:
        query = query.where(models.BookingDocument.booking_id == booking_id)
    return db.scalars(query).first()