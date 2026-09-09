"""CRUD operations for destinations, packages and itinerary days."""
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from . import models, schemas


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