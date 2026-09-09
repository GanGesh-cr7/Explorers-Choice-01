"""Add users.token_version (session invalidation on password change) + CI indexes

Revision ID: 0005
Revises: 0004
Create Date: 2026-09-09
"""
from alembic import op
import sqlalchemy as sa

revision = "0005"
down_revision = "0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("token_version", sa.Integer(), nullable=False, server_default=sa.text("0")),
    )
    op.create_index("ix_users_is_staff", "users", ["is_staff"])
    op.create_index("ix_enquiries_status_created", "enquiries", ["status", "created_at"])


def downgrade() -> None:
    op.drop_index("ix_enquiries_status_created", table_name="enquiries")
    op.drop_index("ix_users_is_staff", table_name="users")
    op.drop_column("users", "token_version")