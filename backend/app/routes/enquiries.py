"""Public enquiry capture for the marketing contact form (GAP-01).

Anyone can submit an enquiry; it is stored as an Enquiry record so it appears
in the admin CRM. Rate limited to prevent spam.
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from .. import crud, schemas, security
from ..database import get_db

router = APIRouter()


@router.post("", response_model=schemas.EnquiryRead, status_code=status.HTTP_201_CREATED)
def create_public_enquiry(
    data: schemas.PublicEnquiryCreate,
    db: Session = Depends(get_db),
    _rl: None = Depends(security.rate_limit("public-enquiry", limit=10, window_seconds=600)),
):
    """Persist a contact-form enquiry so a planner can follow up."""
    enquiry_data = schemas.EnquiryCreate(
        customer_name=data.customer_name,
        email=data.email,
        phone=data.phone,
        country=data.country,
        destination_interest=data.destination_interest,
        travellers=data.travellers,
        budget=data.budget,
        message=data.message,
        status="NEW",
    )
    return crud.create_enquiry(db, enquiry_data, actor=None)
