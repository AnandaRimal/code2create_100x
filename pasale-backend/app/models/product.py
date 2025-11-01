from sqlalchemy import Column, String, Float, Integer, TIMESTAMP, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Product(Base):
    __tablename__ = "products"

    # Store UUIDs as 36-char strings for MySQL compatibility
    product_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_id = Column(String(36), ForeignKey("shopkeepers.shop_id", ondelete="CASCADE"), nullable=False)
    product_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    price = Column(Float, nullable=False)
    unit = Column(String(50), nullable=True)  # "piece", "kg", "liter", etc.
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    version = Column(Integer, default=1)  # For conflict resolution

    # Relationships
    shopkeeper = relationship("Shopkeeper", back_populates="products")
    transactions = relationship("Transaction", back_populates="product")