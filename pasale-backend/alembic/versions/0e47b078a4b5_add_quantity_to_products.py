"""add_quantity_to_products

Revision ID: 0e47b078a4b5
Revises: 25a382cd128b
Create Date: 2025-11-01 11:34:01.606289

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0e47b078a4b5'
down_revision: Union[str, None] = '25a382cd128b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add quantity column to products table
    op.add_column('products', sa.Column('quantity', sa.Integer(), nullable=False, server_default='0'))


def downgrade() -> None:
    # Remove quantity column from products table
    op.drop_column('products', 'quantity')
