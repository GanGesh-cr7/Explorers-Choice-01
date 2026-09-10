"""Customer-only endpoints for their own bookings, payments and documents.

Every booking is resolved and then verified to belong to the logged-in user
before any data is returned, so a customer can never read or mutate another
customer's journeys.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from .. import crud, schemas, security
from ..database import get_db

router = APIRouter()


def _owned_booking(db: Session, user, booking_id: int):
    booking = crud.get_booking(db, booking_id)
    if booking is None or booking.user_id != user.id:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.get("", response_model=list[schemas.BookingRead])
def my_bookings(user=Depends(security.get_current_user), db: Session = Depends(get_db)):
    return crud.list_bookings(db, user_id=user.id)


@router.get("/{booking_id}", response_model=schemas.BookingDetail)
def my_booking(
    booking_id: int,
    user=Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    booking = _owned_booking(db, user, booking_id)
    booking.package_slug = booking.package.slug
    booking.payments = crud.list_payments(db, booking.id)
    booking.documents = crud.list_documents(db, booking.id)
    return booking


@router.get("/{booking_id}/payments", response_model=list[schemas.PaymentRead])
def my_payments(
    booking_id: int,
    user=Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    _owned_booking(db, user, booking_id)
    return crud.list_payments(db, booking_id)


@router.get("/{booking_id}/documents", response_model=list[schemas.DocumentRead])
def my_documents(
    booking_id: int,
    user=Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    _owned_booking(db, user, booking_id)
    return crud.list_documents(db, booking_id)


@router.get("/documents/{document_id}/download")
def download_document(
    document_id: int,
    user=Depends(security.get_current_user),
    db: Session = Depends(get_db),
):
    """Stream a booking document only when the customer owns its booking."""
    document = crud.get_document(db, document_id=document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    # Verify ownership via the booking
    booking = crud.get_booking(db, document.booking_id)
    if booking is None or booking.user_id != user.id:
        raise HTTPException(status_code=404, detail="Document not found")
    from pathlib import Path
    resolved = Path(document.file_path).resolve()
    if not resolved.is_file():
        raise HTTPException(status_code=404, detail="File not found on server")
    return FileResponse(
        path=str(resolved),
        filename=document.file_name,
        media_type="application/octet-stream",
    )
