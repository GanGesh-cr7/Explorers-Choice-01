"""Customer booking request and protected booking management endpoints."""
from datetime import date

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import crud, schemas, security
from ..database import get_db
from ..email_service import send_booking_notification_email

router = APIRouter()
admin_router = APIRouter()


@router.post("", response_model=schemas.BookingRead, status_code=status.HTTP_201_CREATED)
def create_booking(
    data: schemas.BookingCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(security.optional_current_user),
    _rl: None = Depends(security.rate_limit("create-booking", limit=15, window_seconds=600)),
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

    booking_data = {
        "booking_reference": booking.booking_reference,
        "package_name": booking.package_name,
        "destination_name": booking.destination_name,
        "duration_days": booking.duration_days,
        "travel_date": booking.travel_date,
        "adults": booking.adults,
        "children": booking.children,
        "infants": booking.infants,
        "full_name": booking.full_name,
        "email": booking.email,
        "phone": booking.phone,
        "country": booking.country,
        "departure_information": booking.departure_information,
        "special_requirements": booking.special_requirements,
        "notes": booking.notes,
        "subtotal": float(booking.subtotal),
        "taxes": float(booking.taxes),
        "total": float(booking.total),
        "currency": booking.currency,
        "status": booking.status,
        "payment_status": booking.payment_status,
        "booking_mode": booking.booking_mode,
        "created_at": booking.created_at,
    }
    background_tasks.add_task(send_booking_notification_email, booking_data)

    return booking


@router.get("/reference/{reference}", response_model=schemas.BookingConfirmationRead)
def get_booking_confirmation(
    reference: str,
    db: Session = Depends(get_db),
    _rl: None = Depends(security.rate_limit("lookup-booking", limit=30, window_seconds=300)),
):
    """Public confirmation lookup by booking reference.

    Returns only a safe, non-sensitive subset (no contact details / PII) so
    customers can re-open their confirmation page using the reference. The
    reference is a high-entropy token, which provides a reasonable barrier to
    casual enumeration.
    """
    booking = crud.get_booking_by_reference(db, reference)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@admin_router.get(
    "/bookings",
    response_model=list[schemas.BookingRead],
    dependencies=[Depends(security.require_admin)],
)
def admin_list_bookings(
    booking_status: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
):
    return crud.list_bookings(db, admin_view=True, booking_status=booking_status)


@admin_router.get(
    "/bookings/{booking_id}",
    response_model=schemas.BookingAdminDetail,
    dependencies=[Depends(security.require_admin)],
)
def admin_get_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = crud.get_booking(db, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.package_slug = booking.package.slug
    booking.payments = crud.list_payments(db, booking.id)
    booking.documents = crud.list_documents(db, booking.id)
    booking.travellers = booking.travellers or []
    booking.internal_notes = crud.list_booking_notes(db, booking.id)
    return booking


@admin_router.patch(
    "/bookings/{booking_id}",
    response_model=schemas.BookingRead,
    dependencies=[Depends(security.require_roles("TRAVEL_AGENT", "MANAGER", "ADMIN"))],
)
def admin_update_booking(
    booking_id: int,
    data: schemas.BookingStatusUpdate,
    db: Session = Depends(get_db),
    user=Depends(security.require_roles("TRAVEL_AGENT", "MANAGER", "ADMIN")),
):
    booking = crud.get_booking(db, booking_id)
    if booking is None:
        raise HTTPException(status_code=404, detail="Booking not found")
    return crud.update_booking_status(db, booking, data, actor=user)
