"""Package endpoints.

Public:  GET /api/packages, GET /api/packages/{slug}
Admin:   POST|PATCH|DELETE under /api/admin/packages (MANAGER or ADMIN)
"""
import re
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..security import require_roles
from ..database import get_db

IMAGE_UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads" / "package_images"
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB


def _safe_filename(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9._-]", "_", Path(name).name)

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
@admin_router.get(
    "/packages",
    response_model=list[schemas.PackageSummary],
    dependencies=[Depends(require_roles("MANAGER", "ADMIN"))],
)
def admin_list_packages(db: Session = Depends(get_db)):
    """List every package (active and archived) for the admin workspace."""
    return crud.list_packages(db, active_only=False)


@admin_router.get(
    "/packages/{package_id}",
    response_model=schemas.PackageRead,
    dependencies=[Depends(require_roles("MANAGER", "ADMIN"))],
)
def admin_get_package(package_id: int, db: Session = Depends(get_db)):
    package = crud.get_package(db, package_id=package_id)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    return package


@admin_router.post(
    "/packages",
    response_model=schemas.PackageRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("MANAGER", "ADMIN"))],
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
    dependencies=[Depends(require_roles("MANAGER", "ADMIN"))],
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
    dependencies=[Depends(require_roles("MANAGER", "ADMIN"))],
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
    return {"detail": "Package deleted successfully"}


# ---------------------------------------------------------------------------
# Admin: itinerary management
# ---------------------------------------------------------------------------
@admin_router.put(
    "/packages/{package_id}/itinerary",
    response_model=schemas.PackageRead,
    dependencies=[Depends(require_roles("MANAGER", "ADMIN"))],
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
    dependencies=[Depends(require_roles("MANAGER", "ADMIN"))],
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


# ---------------------------------------------------------------------------
# Admin: image upload
# ---------------------------------------------------------------------------
@admin_router.post(
    "/packages/upload-image",
    dependencies=[Depends(require_roles("MANAGER", "ADMIN"))],
)
def admin_upload_package_image(file: UploadFile = File(...)):
    """Upload a package image; returns the public URL to store in hero_image/gallery."""
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP or GIF images are allowed")
    content = file.file.read()
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=413, detail="Image too large. Maximum size is 10 MB.")
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded file is empty")
    IMAGE_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    safe_name = _safe_filename(file.filename or "package-image")
    dest = IMAGE_UPLOAD_DIR / safe_name
    if dest.exists():
        stem = dest.stem
        counter = 1
        while dest.exists():
            dest = IMAGE_UPLOAD_DIR / f"{stem}-{counter}{dest.suffix}"
            counter += 1
    with dest.open("wb") as out:
        out.write(content)
    return {"url": f"/admin/packages/images/{dest.name}"}


@admin_router.get("/packages/images/{filename}")
def admin_serve_package_image(filename: str):
    """Serve an uploaded package image (used as hero_image / gallery)."""
    safe_name = _safe_filename(filename)
    if safe_name != filename:
        raise HTTPException(status_code=400, detail="Invalid file name")
    dest = IMAGE_UPLOAD_DIR / safe_name
    if not dest.is_file():
        raise HTTPException(status_code=404, detail="Image not found")
    content_type = "image/jpeg"
    if dest.suffix.lower() == ".png":
        content_type = "image/png"
    elif dest.suffix.lower() == ".webp":
        content_type = "image/webp"
    elif dest.suffix.lower() == ".gif":
        content_type = "image/gif"
    return FileResponse(str(dest), media_type=content_type)