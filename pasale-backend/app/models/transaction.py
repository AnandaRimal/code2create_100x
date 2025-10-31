from sqlalchemy import Column, String, Float, Integer, TIMESTAMP, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from app.database import Base


class TransactionType(str, enum.Enum):
    SALE = "sale"
    PURCHASE = "purchase"
    RETURN = "return"


class Transaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_id = Column(String(36), ForeignKey("shopkeepers.shop_id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.product_id", ondelete="SET NULL"), nullable=True)
    date_time = Column(TIMESTAMP(timezone=True), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)  # Price at time of transaction
    total = Column(Float, nullable=False)  # quantity * price
    type = Column(Enum(TransactionType), nullable=False, default=TransactionType.SALE)
    synced = Column(Boolean, default=False)
    device_id = Column(String(255), nullable=True)
    version = Column(Integer, default=1)

    # Relationships
    shopkeeper = relationship("Shopkeeper", back_populates="transactions")
    product = relationship("Product", back_populates="transactions")
    rewards = relationship("Reward", back_populates="transaction")