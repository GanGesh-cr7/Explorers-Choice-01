"""admin operations: user roles, enquiries CRM, customer stories, offers, audit log, booking notes and settings

Revision ID: 0004
Revises: 0003
Create Date: 2026-09-09
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("role", sa.String(32), nullable=False, server_default="CUSTOMER"))
    op.add_column("users", sa.Column("is_staff", sa.Boolean(), nullable=False, server_default=sa.text("false")))
    op.create_index("ix_users_role", "users", ["role"])

    op.create_table(
        "enquiries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("customer_name", sa.String(160), nullable=False),
        sa.Column("email", sa.String(254), nullable=False),
        sa.Column("phone", sa.String(60), nullable=False, server_default=""),
        sa.Column("country", sa.String(120), nullable=False, server_default=""),
        sa.Column("destination_interest", sa.String(160), nullable=False, server_default=""),
        sa.Column("package_id", sa.Integer(), sa.ForeignKey("packages.id", ondelete="SET NULL"), nullable=True),
        sa.Column("package_name", sa.String(200), nullable=False, server_default=""),
        sa.Column("travel_date_from", sa.Date(), nullable=True),
        sa.Column("travel_date_to", sa.Date(), nullable=True),
        sa.Column("travellers", sa.Integer(), nullable=False, server_default="2"),
        sa.Column("budget", sa.String(120), nullable=False, server_default=""),
        sa.Column("message", sa.Text(), nullable=False, server_default=""),
        sa.Column("notes", sa.Text(), nullable=False, server_default=""),
        sa.Column("status", sa.String(32), nullable=False, server_default="NEW"),
        sa.Column("assigned_staff_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("last_contact_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("next_action", sa.String(320), nullable=False, server_default=""),
        sa.Column("next_action_at", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_enquiries_email", "enquiries", ["email"])
    op.create_index("ix_enquiries_status", "enquiries", ["status"])
    op.create_index("ix_enquiries_assigned_staff_id", "enquiries", ["assigned_staff_id"])

    op.create_table(
        "customer_stories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("customer_name", sa.String(160), nullable=False),
        sa.Column("destination", sa.String(160), nullable=False, server_default=""),
        sa.Column("package_id", sa.Integer(), sa.ForeignKey("packages.id", ondelete="SET NULL"), nullable=True),
        sa.Column("package_name", sa.String(200), nullable=False, server_default=""),
        sa.Column("story", sa.Text(), nullable=False, server_default=""),
        sa.Column("photos", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
        sa.Column("travel_date", sa.Date(), nullable=True),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_published", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    op.create_table(
        "offers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("code", sa.String(40), nullable=False, server_default=""),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("discount_type", sa.String(16), nullable=False, server_default="PERCENT"),
        sa.Column("discount_value", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("package_id", sa.Integer(), sa.ForeignKey("packages.id", ondelete="SET NULL"), nullable=True),
        sa.Column("package_name", sa.String(200), nullable=False, server_default=""),
        sa.Column("valid_from", sa.Date(), nullable=True),
        sa.Column("valid_to", sa.Date(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )

    op.create_table(
        "booking_notes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("booking_id", sa.Integer(), sa.ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_booking_notes_booking_id", "booking_notes", ["booking_id"])

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("username", sa.String(254), nullable=False, server_default=""),
        sa.Column("action", sa.String(120), nullable=False),
        sa.Column("entity", sa.String(80), nullable=False),
        sa.Column("entity_id", sa.String(64), nullable=False, server_default=""),
        sa.Column("details", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_audit_logs_created_at", "audit_logs", ["created_at"])

    op.create_table(
        "settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key", sa.String(120), nullable=False),
        sa.Column("value", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("updated_by", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_settings_key", "settings", ["key"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_settings_key", table_name="settings")
    op.drop_table("settings")
    op.drop_index("ix_audit_logs_created_at", table_name="audit_logs")
    op.drop_table("audit_logs")
    op.drop_index("ix_booking_notes_booking_id", table_name="booking_notes")
    op.drop_table("booking_notes")
    op.drop_table("offers")
    op.drop_table("customer_stories")
    op.drop_index("ix_enquiries_assigned_staff_id", table_name="enquiries")
    op.drop_index("ix_enquiries_status", table_name="enquiries")
    op.drop_index("ix_enquiries_email", table_name="enquiries")
    op.drop_table("enquiries")
    op.drop_index("ix_users_role", table_name="users")
    op.drop_column("users", "role")
    op.drop_column("users", "is_staff")