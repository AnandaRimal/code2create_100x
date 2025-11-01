"""inventory

Revision ID: 67db821500ee
Revises: 74fdf73f2a5b
Create Date: 2025-11-01 07:25:00.422476

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '67db821500ee'
down_revision: Union[str, None] = '74fdf73f2a5b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
