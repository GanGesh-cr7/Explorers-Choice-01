"""Package endpoints.

Public:  GET /api/packages, GET /api/packages/{slug}
Admin:   POST|PATCH|DELETE under /api/admin/packages (requires admin key)
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..admin_auth import require_admin
from ..database import get_db

router = APIRouter()
admin_router = APIRouter()


# ---------------------------------------------------------------------------
# Public
# ---------------------------------------------------------------------------
@router.get("", response_model=list[schemas.PackageSummary])
def list_packages(
    featured: bool = Query(default=False),
    destination_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """List active packages, optionally filtered by destination or featured."""
    if destination_id is not None:
        return crud.get_packages_by_destination(db, destination_id, active_only=True)
    return crud.list_packages(db, active_only=True, featured_only=featured)


@router.get("/{slug}", response_model=schemas.PackageRead)
def get_package(slug: str, db: Session = Depends(get_db)):
    package = crud.get_package(db, slug=slug)
    if not package or not package.is_active:
        raise HTTPException(status_code=404, detail="Package not found")
    return package


# ---------------------------------------------------------------------------
# Admin (protected)
# ---------------------------------------------------------------------------
@admin_router.post(
    "/packages",
    response_model=schemas.PackageRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def admin_create_package(data: schemas.PackageCreate, db: Session = Depends(get_db)):
    if crud.get_destination(db, destination_id=data.destination_id) is None:
        raise HTTPException(status_code=400, detail="destination_id does not exist")
    if crud.get_package(db, slug=data.slug):
        raise HTTPException(status_code=409, detail="Slug already in use")
    return crud.create_package(db, data)


@admin_router.patch(
    "/packages/{package_id}",
    response_model=schemas.PackageRead,
    dependencies=[Depends(require_admin)],
)
def admin_update_package(
    package_id: int, data: schemas.PackageUpdate, db: Session = Depends(get_db)
):
    package = crud.get_package(db, package_id=package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    if data.slug and data.slug != package.slug and crud.get_package(db, slug=data.slug):
        raise HTTPException(status_code=409, detail="Slug already in use")
    if data.destination_id and crud.get_destination(db, destination_id=data.destination_id) is None:
        raise HTTPException(status_code=400, detail="destination_id does not exist")
    return crud.update_package(db, package, data)


@admin_router.delete(
    "/packages/{package_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def admin_delete_package(
    package_id: int,
    hard: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    """Archive (soft-delete) a package, or hard-delete with `?hard=true`."""
    package = crud.get_package(db, package_id=package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    crud.delete_package(db, package, hard=hard)


# ---------------------------------------------------------------------------
# Admin: itinerary management
# ---------------------------------------------------------------------------
@admin_router.put(
    "/packages/{package_id}/itinerary",
    response_model=schemas.PackageRead,
    dependencies=[Depends(require_admin)],
)
def admin_replace_itinerary(
    package_id: int,
    days: list[schemas.ItineraryDayCreate],
    db: Session = Depends(get_db),
):
    """Replace the full day-by-day itinerary for a package."""
    package = crud.get_package(db, package_id=package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    crud.upsert_itinerary_days(db, package, days)
    return crud.get_package(db, package_id=package_id)


@admin_router.post(
    "/packages/{package_id}/itinerary",
    response_model=schemas.PackageRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def admin_add_itinerary_day(
    package_id: int,
    day: schemas.ItineraryDayCreate,
    db: Session = Depends(get_db),
):
    """Append a single itinerary day to a package."""
    package = crud.get_package(db, package_id=package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    existing = sorted(package.itinerary, key=lambda d: d.day_number)
    new_day = models.ItineraryDay(package_id=package.id, **day.model_dump())
    db.add(new_day)
    db.commit()
    return crud.get_package(db, package_id=package_id)