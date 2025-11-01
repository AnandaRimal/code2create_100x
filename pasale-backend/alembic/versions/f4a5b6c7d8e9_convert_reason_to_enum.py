"""convert reason column to ENUM

Revision ID: f4a5b6c7d8e9
Revises: e3b2c3d4e5f7
Create Date: 2025-11-01 07:35:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'f4a5b6c7d8e9'
down_revision = 'e3b2c3d4e5f7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # MySQL ENUM values must match the application's RewardReason enum strings
    enum_values = [
        'transaction_sale',
        'transaction_purchase',
        'daily_bonus',
        'streak_bonus',
        'manual_adjustment',
        'fraud_reversal',
        'redemption'
    ]
    # Build ENUM literal
    enum_sql = ",".join(f"'{v}'" for v in enum_values)
    # Alter the column to ENUM; keep NULLability as-is
    op.execute(sa.text(f"ALTER TABLE rewards MODIFY COLUMN reason ENUM({enum_sql}) NULL"))


def downgrade() -> None:
    # Revert to varchar(255)
    op.execute(sa.text("ALTER TABLE rewards MODIFY COLUMN reason VARCHAR(255) NULL"))
