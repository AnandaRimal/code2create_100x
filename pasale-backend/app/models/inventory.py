from sqlalchemy import Column, String, Integer, Float, TIMESTAMP, ForeignKey, Enum, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from app.database import Base

class MovementType(str, enum.Enum):
    OPENING_STOCK = "opening_stock"
    SALE = "sale"
    PURCHASE = "purchase"
    RETURN = "return"
    ADJUSTMENT = "adjustment"  # Manual correction
    DAMAGE = "damage"
    THEFT = "theft"

class Inventory(Base):
    __tablename__ = "inventory"
    
    # Use string UUIDs for MySQL compatibility
    inventory_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_id = Column(String(36), ForeignKey("shopkeepers.shop_id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    current_quantity = Column(Integer, default=0, nullable=False)
    reorder_level = Column(Integer, default=10, nullable=True)  # Alert when stock falls below this
    last_updated = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    shopkeeper = relationship("Shopkeeper", backref="inventory")
    product = relationship("Product", backref="inventory")
    
    # Ensure unique inventory per product per shop
    __table_args__ = (
        CheckConstraint('current_quantity >= -1000', name='check_reasonable_quantity'),
    )

class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    
    movement_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_id = Column(String(36), ForeignKey("shopkeepers.shop_id", ondelete="CASCADE"), nullable=False)
    product_id = Column(String(36), ForeignKey("products.product_id", ondelete="CASCADE"), nullable=False)
    movement_type = Column(Enum(MovementType), nullable=False)
    quantity_change = Column(Integer, nullable=False)  # Positive for additions, negative for reductions
    quantity_after = Column(Integer, nullable=False)  # Stock level after this movement
    transaction_id = Column(String(36), ForeignKey("transactions.transaction_id", ondelete="SET NULL"), nullable=True)
    notes = Column(String, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    created_by = Column(String, nullable=True)  # For manual adjustments, track who made it
    
    # Relationships
    shopkeeper = relationship("Shopkeeper", backref="inventory_movements")
    product = relationship("Product", backref="inventory_movements")
    transaction = relationship("Transaction", backref="inventory_movements")