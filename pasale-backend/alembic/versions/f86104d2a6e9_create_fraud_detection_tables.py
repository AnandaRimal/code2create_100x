"""create fraud detection tables

Revision ID: f86104d2a6e9
Revises: d3eb80bfaa19
Create Date: 2025-11-01 10:28:34.089761

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f86104d2a6e9'
down_revision: Union[str, None] = 'd3eb80bfaa19'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Create enums for fraud types/levels/status
    fraud_type_enum = sa.Enum(
        'velocity', 'quantity', 'pattern', 'price', 'inventory', 'duplicate', 'time', 'behavioral', 'ml_detected',
        name='fraudtype'
    )
    fraud_type_enum.create(bind, checkfirst=True)

    fraud_risk_enum = sa.Enum('low', 'medium', 'high', 'critical', name='fraudrisklevel')
    fraud_risk_enum.create(bind, checkfirst=True)

    fraud_status_enum = sa.Enum('flagged', 'under_review', 'confirmed_fraud', 'false_positive', 'resolved', name='fraudstatus')
    fraud_status_enum.create(bind, checkfirst=True)

    # Create fraud_alerts table
    if not inspector.has_table('fraud_alerts'):
        op.create_table(
            'fraud_alerts',
            sa.Column('alert_id', sa.String(length=36), primary_key=True, nullable=False),
            sa.Column('shop_id', sa.String(length=36), nullable=False),
            sa.Column('transaction_id', sa.String(length=36), nullable=True),
            sa.Column('fraud_type', fraud_type_enum, nullable=False),
            sa.Column('risk_level', fraud_risk_enum, nullable=False),
            sa.Column('status', fraud_status_enum, nullable=False, server_default=sa.text("'flagged'")),
            sa.Column('confidence_score', sa.Float(), nullable=False),
            sa.Column('details', sa.JSON(), nullable=True),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
            sa.Column('reviewed_at', sa.TIMESTAMP(timezone=True), nullable=True),
            sa.Column('reviewed_by', sa.String(length=255), nullable=True),
        )

        # Add foreign keys
        op.create_foreign_key('fk_fraud_alerts_shop', 'fraud_alerts', 'shopkeepers', ['shop_id'], ['shop_id'], ondelete='CASCADE')
        op.create_foreign_key('fk_fraud_alerts_txn', 'fraud_alerts', 'transactions', ['transaction_id'], ['transaction_id'], ondelete='CASCADE')

    # Create shop_fraud_scores table
    if not inspector.has_table('shop_fraud_scores'):
        op.create_table(
            'shop_fraud_scores',
            sa.Column('score_id', sa.String(length=36), primary_key=True, nullable=False),
            sa.Column('shop_id', sa.String(length=36), nullable=False),
            sa.Column('overall_score', sa.Float(), nullable=False, server_default='0'),
            sa.Column('velocity_score', sa.Float(), nullable=False, server_default='0'),
            sa.Column('pattern_score', sa.Float(), nullable=False, server_default='0'),
            sa.Column('quantity_score', sa.Float(), nullable=False, server_default='0'),
            sa.Column('behavioral_score', sa.Float(), nullable=False, server_default='0'),
            sa.Column('total_alerts', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('confirmed_frauds', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('false_positives', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('is_suspended', sa.Boolean(), nullable=False, server_default=sa.text('0')),
            sa.Column('last_calculated', sa.TIMESTAMP(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        )
        op.create_foreign_key('fk_shop_fraud_scores_shop', 'shop_fraud_scores', 'shopkeepers', ['shop_id'], ['shop_id'], ondelete='CASCADE')
        op.create_unique_constraint('uq_shop_fraud_scores_shop', 'shop_fraud_scores', ['shop_id'])


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Drop tables if they exist
    if inspector.has_table('shop_fraud_scores'):
        op.drop_table('shop_fraud_scores')

    if inspector.has_table('fraud_alerts'):
        op.drop_table('fraud_alerts')

    # Drop enums
    sa.Enum(name='fraudstatus').drop(bind, checkfirst=True)
    sa.Enum(name='fraudrisklevel').drop(bind, checkfirst=True)
    sa.Enum(name='fraudtype').drop(bind, checkfirst=True)
