"""add Google OAuth columns to users

Revision ID: 0008
Revises: 0007
Create Date: 2026-09-11
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0008"
down_revision: Union[str, None] = "0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on = None


def upgrade() -> None:
    # batch_alter_table lets this migration run on both PostgreSQL and
    # SQLite (which cannot ALTER COLUMN natively).
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(
            sa.Column("auth_provider", sa.String(20), nullable=False, server_default="EMAIL")
        )
        batch_op.add_column(
            sa.Column("provider_account_id", sa.String(160), nullable=True)
        )
        batch_op.alter_column("password_hash", existing_type=sa.String(255), nullable=True)
        batch_op.create_index("ix_users_provider_account_id", ["provider_account_id"])


def downgrade() -> None:
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_index("ix_users_provider_account_id")
        batch_op.alter_column("password_hash", existing_type=sa.String(255), nullable=False)
        batch_op.drop_column("provider_account_id")
        batch_op.drop_column("auth_provider")