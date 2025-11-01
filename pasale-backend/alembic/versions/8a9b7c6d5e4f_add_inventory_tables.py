"""add inventory tables

Revision ID: 8a9b7c6d5e4f
Revises: 67db821500ee
Create Date: 2025-11-01 07:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8a9b7c6d5e4f'
down_revision: Union[str, None] = '67db821500ee'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Create inventory table only if it doesn't exist
    if not inspector.has_table('inventory'):
        op.create_table(
            'inventory',
            sa.Column('inventory_id', sa.String(length=36), primary_key=True, nullable=False),
            sa.Column('shop_id', sa.String(length=36), nullable=False),
            sa.Column('product_id', sa.String(length=36), nullable=False),
            sa.Column('current_quantity', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('reorder_level', sa.Integer(), nullable=True),
            sa.Column('last_updated', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        )

    # Create enum type for movement_type if not exists
    movement_enum = sa.Enum('opening_stock', 'sale', 'purchase', 'return', 'adjustment', 'damage', 'theft', name='movementtype')
    movement_enum.create(bind, checkfirst=True)

    # Create inventory_movements table only if it doesn't exist
    if not inspector.has_table('inventory_movements'):
        op.create_table(
            'inventory_movements',
            sa.Column('movement_id', sa.String(length=36), primary_key=True, nullable=False),
            sa.Column('shop_id', sa.String(length=36), nullable=False),
            sa.Column('product_id', sa.String(length=36), nullable=False),
            sa.Column('movement_type', movement_enum, nullable=False),
            sa.Column('quantity_change', sa.Integer(), nullable=False),
            sa.Column('quantity_after', sa.Integer(), nullable=False),
            sa.Column('transaction_id', sa.String(length=36), nullable=True),
            sa.Column('notes', sa.String(length=255), nullable=True),
            sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
            sa.Column('created_by', sa.String(length=255), nullable=True),
        )


def downgrade() -> None:
    op.drop_table('inventory_movements')
    # Drop enum type
    sa.Enum(name='movementtype').drop(op.get_bind(), checkfirst=True)
    op.drop_table('inventory')
