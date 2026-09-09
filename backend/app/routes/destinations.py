"""Destination endpoints.

Public:  GET /api/destinations, GET /api/destinations/{slug}
Admin:   POST|PATCH|DELETE under /api/admin/destinations (requires admin key)
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import crud, schemas
from ..admin_auth import require_admin
from ..database import get_db

router = APIRouter()
admin_router = APIRouter()


# ---------------------------------------------------------------------------
# Public
# ---------------------------------------------------------------------------
@router.get("", response_model=list[schemas.DestinationRead])
def list_destinations(
    featured: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    """List active destinations."""
    return crud.list_destinations(db, active_only=True, featured_only=featured)


@router.get("/{slug}", response_model=schemas.DestinationRead)
def get_destination(slug: str, db: Session = Depends(get_db)):
    destination = crud.get_destination(db, slug=slug)
    if not destination or not destination.is_active:
        raise HTTPException(status_code=404, detail="Destination not found")
    return destination


# ---------------------------------------------------------------------------
# Admin (protected)
# ---------------------------------------------------------------------------
@admin_router.post(
    "/destinations",
    response_model=schemas.DestinationRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_admin)],
)
def admin_create_destination(data: schemas.DestinationCreate, db: Session = Depends(get_db)):
    if crud.get_destination(db, slug=data.slug):
        raise HTTPException(status_code=409, detail="Slug already in use")
    return crud.create_destination(db, data)


@admin_router.patch(
    "/destinations/{destination_id}",
    response_model=schemas.DestinationRead,
    dependencies=[Depends(require_admin)],
)
def admin_update_destination(
    destination_id: int, data: schemas.DestinationUpdate, db: Session = Depends(get_db)
):
    destination = crud.get_destination(db, destination_id=destination_id)
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")
    if data.slug and data.slug != destination.slug and crud.get_destination(db, slug=data.slug):
        raise HTTPException(status_code=409, detail="Slug already in use")
    return crud.update_destination(db, destination, data)


@admin_router.delete(
    "/destinations/{destination_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_admin)],
)
def admin_delete_destination(
    destination_id: int,
    hard: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    """Archive (soft-delete) a destination, or hard-delete with `?hard=true`."""
    destination = crud.get_destination(db, destination_id=destination_id)
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")
    crud.delete_destination(db, destination, hard=hard)