"""reward updated

Revision ID: d00a43b9fb29
Revises: 8be0d24ed8a0
Create Date: 2025-11-01 06:45:53.986608

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd00a43b9fb29'
down_revision: Union[str, None] = '8be0d24ed8a0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
