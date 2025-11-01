"""create inventory tables

Revision ID: 74fdf73f2a5b
Revises: f4a5b6c7d8e9
Create Date: 2025-11-01 07:16:18.707628

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '74fdf73f2a5b'
down_revision: Union[str, None] = 'f4a5b6c7d8e9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
