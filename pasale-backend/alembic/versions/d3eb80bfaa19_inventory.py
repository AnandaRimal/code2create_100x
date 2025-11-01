"""inventory

Revision ID: d3eb80bfaa19
Revises: 8a9b7c6d5e4f
Create Date: 2025-11-01 07:38:54.481700

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd3eb80bfaa19'
down_revision: Union[str, None] = '8a9b7c6d5e4f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
