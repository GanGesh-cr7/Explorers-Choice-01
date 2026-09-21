"""add cab bookings

Revision ID: 0010
Revises: 0009
Create Date: 2026-09-18
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0010"
down_revision: Union[str, None] = "0009"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "cab_bookings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("booking_reference", sa.String(32), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("trip_type", sa.String(32), nullable=False),
        sa.Column("cab_type", sa.String(40), nullable=False),
        sa.Column("pickup_location", sa.String(300), nullable=False),
        sa.Column("drop_location", sa.String(300), nullable=False),
        sa.Column("pickup_date", sa.Date(), nullable=False),
        sa.Column("pickup_time", sa.String(5), nullable=False),
        sa.Column("distance_kms", sa.Numeric(8, 2), nullable=False, server_default="0"),
        sa.Column("passengers", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("full_name", sa.String(160), nullable=False),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("phone", sa.String(60), nullable=False),
        sa.Column("special_requirements", sa.Text(), nullable=False, server_default=""),
        sa.Column("base_fare", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("convenience_fee", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("gst", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("total_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(3), nullable=False, server_default="INR"),
        sa.Column("status", sa.String(32), nullable=False, server_default="PENDING_CONFIRMATION"),
        sa.Column("idempotency_key", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_cab_bookings_booking_reference", "cab_bookings", ["booking_reference"], unique=True)
    op.create_index("ix_cab_bookings_user_id", "cab_bookings", ["user_id"])
    op.create_index("ix_cab_bookings_pickup_date", "cab_bookings", ["pickup_date"])
    op.create_index("ix_cab_bookings_email", "cab_bookings", ["email"])
    op.create_index("ix_cab_bookings_trip_type", "cab_bookings", ["trip_type"])
    op.create_index("ix_cab_bookings_status", "cab_bookings", ["status"])
    op.create_index("ix_cab_bookings_idempotency_key", "cab_bookings", ["idempotency_key"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_cab_bookings_idempotency_key", table_name="cab_bookings")
    op.drop_index("ix_cab_bookings_status", table_name="cab_bookings")
    op.drop_index("ix_cab_bookings_trip_type", table_name="cab_bookings")
    op.drop_index("ix_cab_bookings_email", table_name="cab_bookings")
    op.drop_index("ix_cab_bookings_pickup_date", table_name="cab_bookings")
    op.drop_index("ix_cab_bookings_user_id", table_name="cab_bookings")
    op.drop_index("ix_cab_bookings_booking_reference", table_name="cab_bookings")
    op.drop_table("cab_bookings")