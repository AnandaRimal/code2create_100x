"""create fraud detection tables

Revision ID: 25a382cd128b
Revises: f86104d2a6e9
Create Date: 2025-11-01 10:50:08.209137

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '25a382cd128b'
down_revision: Union[str, None] = 'f86104d2a6e9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
