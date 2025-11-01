"""update rewards table for ledger system

Revision ID: 8be0d24ed8a0
Revises: e4f67a42d547
Create Date: 2025-11-01 06:36:50.223721

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8be0d24ed8a0'
down_revision: Union[str, None] = 'e4f67a42d547'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
