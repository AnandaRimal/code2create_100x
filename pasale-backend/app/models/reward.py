# - SALE transaction: 2 points
# - PURCHASE transaction: 1 point (to track supply chain)
# - RETURN transaction: 0 points (neutral, but we still want to track)
# - Bonus: 10 points for logging 10+ transactions in a day
# - Bonus: 50 points for 7-day streak (at least 5 transactions daily)



from sqlalchemy import Column, String, Integer, TIMESTAMP, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from app.database import Base

class RewardReason(str, enum.Enum):
    TRANSACTION_SALE = "transaction_sale"
    TRANSACTION_PURCHASE = "transaction_purchase"
    DAILY_BONUS = "daily_bonus"
    STREAK_BONUS = "streak_bonus"
    MANUAL_ADJUSTMENT = "manual_adjustment"
    FRAUD_REVERSAL = "fraud_reversal"
    REDEMPTION = "redemption"

class Reward(Base):
    __tablename__ = "rewards"
    
    # Use string UUIDs for MySQL compatibility
    reward_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_id = Column(String(36), ForeignKey("shopkeepers.shop_id", ondelete="CASCADE"), nullable=False)
    points_change = Column(Integer, nullable=False)  # Can be positive or negative
    balance_after = Column(Integer, nullable=False)  # Running balance
    reason = Column(Enum(RewardReason), nullable=False)
    source_txn_id = Column(String(36), ForeignKey("transactions.transaction_id", ondelete="SET NULL"), nullable=True)
    notes = Column(String, nullable=True)  # Additional context
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    # Relationships
    shopkeeper = relationship("Shopkeeper", back_populates="rewards")
    transaction = relationship("Transaction", back_populates="rewards")