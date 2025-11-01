"""rename rewards columns to match models

Revision ID: e3b2c3d4e5f7
Revises: e3a1b2c4d5f6
Create Date: 2025-11-01 07:20:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = 'e3b2c3d4e5f7'
down_revision = 'e3a1b2c4d5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Use raw ALTER TABLE statements for MySQL to rename columns reliably
    conn = op.get_bind()
    try:
        conn.execute(sa.text("ALTER TABLE rewards CHANGE COLUMN points points_change INT NOT NULL"))
    except Exception:
        # If already renamed or column missing, ignore
        pass
    try:
        conn.execute(sa.text("ALTER TABLE rewards CHANGE COLUMN last_updated created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP"))
    except Exception:
        pass


def downgrade() -> None:
    conn = op.get_bind()
    try:
        conn.execute(sa.text("ALTER TABLE rewards CHANGE COLUMN points_change points INT NOT NULL"))
    except Exception:
        pass
    try:
        conn.execute(sa.text("ALTER TABLE rewards CHANGE COLUMN created_at last_updated TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP"))
    except Exception:
        pass
