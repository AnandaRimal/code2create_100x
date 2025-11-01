"""fix rewards schema

Revision ID: e3a1b2c4d5f6
Revises: d00a43b9fb29
Create Date: 2025-11-01 07:10:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'e3a1b2c4d5f6'
down_revision = 'd00a43b9fb29'
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()

    # Rename 'points' -> 'points_change' if present
    try:
        res = conn.execute(sa.text("SHOW COLUMNS FROM rewards LIKE 'points'"))
        if res.fetchone():
            op.alter_column('rewards', 'points', new_column_name='points_change')
    except Exception:
        pass

    # Rename 'last_updated' -> 'created_at' if present
    try:
        res = conn.execute(sa.text("SHOW COLUMNS FROM rewards LIKE 'last_updated'"))
        if res.fetchone():
            op.alter_column('rewards', 'last_updated', new_column_name='created_at')
    except Exception:
        pass

    # Add balance_after column if missing
    try:
        res = conn.execute(sa.text("SHOW COLUMNS FROM rewards LIKE 'balance_after'"))
        if not res.fetchone():
            op.add_column('rewards', sa.Column('balance_after', sa.Integer(), nullable=False, server_default='0'))
    except Exception:
        pass

    # Add notes column if missing
    try:
        res = conn.execute(sa.text("SHOW COLUMNS FROM rewards LIKE 'notes'"))
        if not res.fetchone():
            op.add_column('rewards', sa.Column('notes', sa.String(length=255), nullable=True))
    except Exception:
        pass


def downgrade() -> None:
    conn = op.get_bind()

    # Drop notes if exists
    try:
        res = conn.execute(sa.text("SHOW COLUMNS FROM rewards LIKE 'notes'"))
        if res.fetchone():
            op.drop_column('rewards', 'notes')
    except Exception:
        pass

    # Drop balance_after if exists
    try:
        res = conn.execute(sa.text("SHOW COLUMNS FROM rewards LIKE 'balance_after'"))
        if res.fetchone():
            op.drop_column('rewards', 'balance_after')
    except Exception:
        pass

    # Rename created_at back to last_updated if present
    try:
        res = conn.execute(sa.text("SHOW COLUMNS FROM rewards LIKE 'created_at'"))
        if res.fetchone():
            op.alter_column('rewards', 'created_at', new_column_name='last_updated')
    except Exception:
        pass

    # Rename points_change back to points if present
    try:
        res = conn.execute(sa.text("SHOW COLUMNS FROM rewards LIKE 'points_change'"))
        if res.fetchone():
            op.alter_column('rewards', 'points_change', new_column_name='points')
    except Exception:
        pass
