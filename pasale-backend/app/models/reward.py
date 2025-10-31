from sqlalchemy import Column, String, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Reward(Base):
    __tablename__ = "rewards"

    reward_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_id = Column(String(36), ForeignKey("shopkeepers.shop_id", ondelete="CASCADE"), nullable=False)
    points = Column(Integer, nullable=False)
    last_updated = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    reason = Column(String(255), nullable=True)
    source_txn_id = Column(String(36), ForeignKey("transactions.transaction_id", ondelete="SET NULL"), nullable=True)

    # Relationships
    shopkeeper = relationship("Shopkeeper", back_populates="rewards")
    transaction = relationship("Transaction", back_populates="rewards")