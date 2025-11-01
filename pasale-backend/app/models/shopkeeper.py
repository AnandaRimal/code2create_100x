from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.database import Base

class Shopkeeper(Base):
    __tablename__ = "shopkeepers"
    
    # Store UUIDs as 36-char strings for MySQL compatibility
    shop_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_name = Column(String(255), nullable=False)
    shop_address = Column(String(255))
    contact = Column(String(50), nullable=False)
    email = Column(String(320), unique=True, nullable=True)
    pan = Column(String(50), unique=True, nullable=True)
    password = Column(String(128), nullable=False)  # Store hashed
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    last_sync = Column(TIMESTAMP(timezone=True), nullable=True)
    
    # Relationships
    products = relationship("Product", back_populates="shopkeeper", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="shopkeeper", cascade="all, delete-orphan")
    rewards = relationship("Reward", back_populates="shopkeeper", cascade="all, delete-orphan")
    sync_logs = relationship("SyncLog", back_populates="shopkeeper", cascade="all, delete-orphan")
    categories = relationship("Category", back_populates="shopkeeper", cascade="all, delete-orphan")