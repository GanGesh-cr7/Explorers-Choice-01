"""Customer booking request and protected booking management endpoints."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import crud, schemas, security
from ..admin_auth import require_admin
from ..database import get_db

router = APIRouter()
admin_router = APIRouter()


@router.post("", response_model=schemas.BookingRead, status_code=status.HTTP_201_CREATED)
def create_booking(
    data: schemas.BookingCreate,
    db: Session = Depends(get_db),
    user=Depends(security.optional_current_user),
):
    """Create a booking request using an authoritative package quote.

    Works for guests and logged-in customers; when a session cookie is
    present the booking is associated with that customer account so it
    appears in My Trips.
    """
    if data.travel_date <= date.today():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Travel date must be in the future.",
        )
    booking = crud.create_booking(db, data, user_id=user.id if user else None)
    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="This package is unavailable. Please choose another journey.",
        )
    return booking


@admin_router.get(
    "/bookings",
    response_model=list[schemas.BookingRead],
    dependencies=[Depends(require_admin)],
)
def admin_list_bookings(
    booking_status: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
):
    return crud.list_bookings(db, status=booking_status)


@admin_router.get(
    "/bookings/{booking_id}",
    response_model=schemas.BookingRead,
    dependencies=[Depends(require_admin)],
)
def admin_get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = crud.get_booking(db, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@admin_router.patch(
    "/bookings/{booking_id}",
    response_model=schemas.BookingRead,
    dependencies=[Depends(require_admin)],
)
def admin_update_booking(
    booking_id: int,
    data: schemas.BookingStatusUpdate,
    db: Session = Depends(get_db),
):
    booking = crud.get_booking(db, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return crud.update_booking_status(db, booking, data)
