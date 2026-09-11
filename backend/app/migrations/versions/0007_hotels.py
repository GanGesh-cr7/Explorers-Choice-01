"""hotel owner listings table

Revision ID: 0007
Revises: 0006
Create Date: 2026-09-10
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "hotels",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(220), nullable=False),
        sa.Column("location", sa.String(160), nullable=False, server_default=""),
        sa.Column("destination", sa.String(160), server_default=""),
        sa.Column("tagline", sa.String(240), server_default=""),
        sa.Column("description", sa.Text(), server_default=""),
        sa.Column("image", sa.String(500), server_default=""),
        sa.Column("price_per_night", sa.Numeric(12, 2), server_default="0"),
        sa.Column("currency", sa.String(3), server_default="INR"),
        sa.Column("amenities", sa.JSON(), server_default="[]"),
        sa.Column("highlights", sa.JSON(), server_default="[]"),
        sa.Column("is_published", sa.Boolean(), server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_hotels_owner_id", "hotels", ["owner_id"])
    op.create_index("ix_hotels_slug", "hotels", ["slug"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_hotels_slug", table_name="hotels")
    op.drop_index("ix_hotels_owner_id", table_name="hotels")
    op.drop_table("hotels")