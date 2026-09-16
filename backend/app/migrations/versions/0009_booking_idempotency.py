"""add booking idempotency key

Revision ID: 0009
Revises: 0008
Create Date: 2026-09-15
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0009"
down_revision: Union[str, None] = "0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # BUG-18: optional client-supplied idempotency key for booking creation.
    # batch_alter_table keeps this working on both PostgreSQL and SQLite.
    with op.batch_alter_table("bookings") as batch_op:
        batch_op.add_column(sa.Column("idempotency_key", sa.String(64), nullable=True))
        batch_op.create_index("ix_bookings_idempotency_key", ["idempotency_key"], unique=True)


def downgrade() -> None:
    with op.batch_alter_table("bookings") as batch_op:
        batch_op.drop_index("ix_bookings_idempotency_key")
        batch_op.drop_column("idempotency_key")
