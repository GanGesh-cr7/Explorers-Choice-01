"""add production booking system

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-09
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "packages",
        sa.Column("booking_mode", sa.String(length=32), nullable=False, server_default="REQUEST_ONLY"),
    )
    op.create_table(
        "bookings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("booking_reference", sa.String(length=32), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("package_id", sa.Integer(), sa.ForeignKey("packages.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("travel_date", sa.Date(), nullable=False),
        sa.Column("adults", sa.Integer(), nullable=False),
        sa.Column("children", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("infants", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("departure_information", sa.Text(), nullable=False, server_default=""),
        sa.Column("full_name", sa.String(length=160), nullable=False),
        sa.Column("email", sa.String(length=254), nullable=False),
        sa.Column("phone", sa.String(length=60), nullable=False),
        sa.Column("country", sa.String(length=120), nullable=False),
        sa.Column("special_requirements", sa.Text(), nullable=False, server_default=""),
        sa.Column("notes", sa.Text(), nullable=False, server_default=""),
        sa.Column("subtotal", sa.Numeric(12, 2), nullable=False),
        sa.Column("taxes", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("total", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="PENDING_CONFIRMATION"),
        sa.Column("payment_status", sa.String(length=32), nullable=False, server_default="NOT_REQUIRED"),
        sa.Column("package_name", sa.String(length=200), nullable=False),
        sa.Column("destination_name", sa.String(length=160), nullable=False),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("booking_mode", sa.String(length=32), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_bookings_booking_reference", "bookings", ["booking_reference"], unique=True)
    op.create_index("ix_bookings_package_id", "bookings", ["package_id"])
    op.create_index("ix_bookings_user_id", "bookings", ["user_id"])
    op.create_index("ix_bookings_email", "bookings", ["email"])
    op.create_index("ix_bookings_status", "bookings", ["status"])
    op.create_index("ix_bookings_created_at", "bookings", ["created_at"])
    op.create_table(
        "booking_travellers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("booking_id", sa.Integer(), sa.ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("traveller_type", sa.String(length=16), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
    )
    op.create_index("ix_booking_travellers_booking_id", "booking_travellers", ["booking_id"])
    op.create_table(
        "payments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("booking_id", sa.Integer(), sa.ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="PENDING"),
        sa.Column("provider", sa.String(length=64), nullable=False, server_default=""),
        sa.Column("provider_reference", sa.String(length=160), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_payments_booking_id", "payments", ["booking_id"])


def downgrade() -> None:
    op.drop_index("ix_payments_booking_id", table_name="payments")
    op.drop_table("payments")
    op.drop_index("ix_booking_travellers_booking_id", table_name="booking_travellers")
    op.drop_table("booking_travellers")
    op.drop_index("ix_bookings_created_at", table_name="bookings")
    op.drop_index("ix_bookings_status", table_name="bookings")
    op.drop_index("ix_bookings_email", table_name="bookings")
    op.drop_index("ix_bookings_user_id", table_name="bookings")
    op.drop_index("ix_bookings_package_id", table_name="bookings")
    op.drop_index("ix_bookings_booking_reference", table_name="bookings")
    op.drop_table("bookings")
    op.drop_column("packages", "booking_mode")
