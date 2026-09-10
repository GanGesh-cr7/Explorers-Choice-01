"""Track requested staff roles separately from granted roles.

Revision ID: 0006
Revises: 0005
Create Date: 2026-09-10
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("requested_role", sa.String(32), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "requested_role")
