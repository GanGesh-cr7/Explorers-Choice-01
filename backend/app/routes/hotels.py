"""Hotel listing endpoints.

Public routers expose published hotel listings for the website; the owner
router lets self-registered HOTEL_OWNER accounts manage their own hotels.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import crud, schemas, security
from ..database import get_db

router = APIRouter()
owner_router = APIRouter()


# ---------------------------------------------------------------------------
# Public hotels
# ---------------------------------------------------------------------------
@router.get("", response_model=list[schemas.HotelRead])
def list_public_hotels(db: Session = Depends(get_db)):
    return crud.list_published_hotels(db)


@router.get("/{slug}", response_model=schemas.HotelRead)
def get_public_hotel(slug: str, db: Session = Depends(get_db)):
    hotel = crud.get_hotel_by_slug(db, slug)
    if hotel is None or not hotel.is_published:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel


# ---------------------------------------------------------------------------
# Hotel owner management
# ---------------------------------------------------------------------------
@owner_router.get("/hotels", response_model=list[schemas.HotelOwnerRead])
def list_my_hotels(
    db: Session = Depends(get_db),
    owner=Depends(security.require_hotel_owner),
):
    return crud.list_owner_hotels(db, owner.id)


@owner_router.post("/hotels", response_model=schemas.HotelOwnerRead, status_code=status.HTTP_201_CREATED)
def create_my_hotel(
    data: schemas.HotelCreate,
    db: Session = Depends(get_db),
    owner=Depends(security.require_hotel_owner),
):
    try:
        return crud.create_hotel(db, owner.id, data)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="A hotel with that name already exists.")


@owner_router.patch("/hotels/{hotel_id}", response_model=schemas.HotelOwnerRead)
def update_my_hotel(
    hotel_id: int,
    data: schemas.HotelUpdate,
    db: Session = Depends(get_db),
    owner=Depends(security.require_hotel_owner),
):
    hotel = crud.get_hotel(db, hotel_id)
    if hotel is None or hotel.owner_id != owner.id:
        raise HTTPException(status_code=404, detail="Hotel not found")
    try:
        return crud.update_hotel(db, hotel, data)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="A hotel with that name already exists.")


@owner_router.delete("/hotels/{hotel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_hotel(
    hotel_id: int,
    db: Session = Depends(get_db),
    owner=Depends(security.require_hotel_owner),
):
    hotel = crud.get_hotel(db, hotel_id)
    if hotel is None or hotel.owner_id != owner.id:
        raise HTTPException(status_code=404, detail="Hotel not found")
    crud.delete_hotel(db, hotel)