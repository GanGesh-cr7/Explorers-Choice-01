"""initial schema for destinations, packages and itineraries

Revision ID: 0001
Revises:
Create Date: 2026-09-08
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "destinations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("slug", sa.String(180), nullable=False),
        sa.Column("country", sa.String(120), nullable=False),
        sa.Column("region", sa.String(120), nullable=False, server_default=""),
        sa.Column("short_description", sa.Text(), nullable=False, server_default=""),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("hero_image", sa.String(500), nullable=False, server_default=""),
        sa.Column("gallery", JSONB, nullable=False, server_default="[]"),
        sa.Column("best_time", sa.String(160), nullable=False, server_default=""),
        sa.Column("recommended_duration", sa.String(120), nullable=False, server_default=""),
        sa.Column("highlights", JSONB, nullable=False, server_default="[]"),
        sa.Column("things_to_do", JSONB, nullable=False, server_default="[]"),
        sa.Column("travel_information", JSONB, nullable=False, server_default="[]"),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_destinations_slug", "destinations", ["slug"], unique=True)

    op.create_table(
        "packages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "destination_id",
            sa.Integer(),
            sa.ForeignKey("destinations.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(220), nullable=False),
        sa.Column("short_description", sa.Text(), nullable=False, server_default=""),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("duration_days", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("duration_nights", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("starting_price", sa.Numeric(12, 2), nullable=False, server_default="0"),
        sa.Column("currency", sa.String(3), nullable=False, server_default="USD"),
        sa.Column("hero_image", sa.String(500), nullable=False, server_default=""),
        sa.Column("gallery", JSONB, nullable=False, server_default="[]"),
        sa.Column("highlights", JSONB, nullable=False, server_default="[]"),
        sa.Column("included", JSONB, nullable=False, server_default="[]"),
        sa.Column("excluded", JSONB, nullable=False, server_default="[]"),
        sa.Column("accommodation_summary", sa.Text(), nullable=False, server_default=""),
        sa.Column("transportation_summary", sa.Text(), nullable=False, server_default=""),
        sa.Column("meal_summary", sa.Text(), nullable=False, server_default=""),
        sa.Column("cancellation_policy", sa.Text(), nullable=False, server_default=""),
        sa.Column("important_information", JSONB, nullable=False, server_default="[]"),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), nullable=False,
            server_default=sa.text("now()"),
        ),
    )
    op.create_index("ix_packages_slug", "packages", ["slug"], unique=True)
    op.create_index("ix_packages_destination_id", "packages", ["destination_id"])

    op.create_table(
        "itinerary_days",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "package_id",
            sa.Integer(),
            sa.ForeignKey("packages.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("day_number", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(240), nullable=False, server_default=""),
        sa.Column("description", sa.Text(), nullable=False, server_default=""),
        sa.Column("activities", JSONB, nullable=False, server_default="[]"),
        sa.Column("meals", sa.String(160), nullable=False, server_default=""),
        sa.Column("accommodation", sa.String(240), nullable=False, server_default=""),
        sa.Column("transportation", sa.String(240), nullable=False, server_default=""),
    )
    op.create_index("ix_itinerary_days_package_id", "itinerary_days", ["package_id"])

    op.create_table(
        "package_faqs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "package_id",
            sa.Integer(),
            sa.ForeignKey("packages.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("question", sa.String(320), nullable=False),
        sa.Column("answer", sa.Text(), nullable=False, server_default=""),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_index("ix_package_faqs_package_id", "package_faqs", ["package_id"])


def downgrade() -> None:
    op.drop_index("ix_package_faqs_package_id", table_name="package_faqs")
    op.drop_table("package_faqs")
    op.drop_index("ix_itinerary_days_package_id", table_name="itinerary_days")
    op.drop_table("itinerary_days")
    op.drop_index("ix_packages_destination_id", table_name="packages")
    op.drop_index("ix_packages_slug", table_name="packages")
    op.drop_table("packages")
    op.drop_index("ix_destinations_slug", table_name="destinations")
    op.drop_table("destinations")