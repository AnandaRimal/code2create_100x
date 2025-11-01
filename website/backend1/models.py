"""
SQLAlchemy models for the Pasale application.
Created to exactly match the MySQL database structure.
"""
from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, DECIMAL, text, Boolean, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class SubscriptionTier(enum.Enum):
    FREE = "FREE"
    BASIC = "BASIC"
    PREMIUM = "PREMIUM"

class Shop(Base):
    __tablename__ = "shops"
    
    pan_id = Column(String(20), primary_key=True)
    shop_name = Column(String(150), nullable=False)
    address = Column(String(255))
    contact = Column(String(20), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    ctzn_no = Column(String(50), unique=True, nullable=False)
    created_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    
    transactions = relationship("Transaction", back_populates="shop")
    rewards = relationship("Reward", back_populates="shop", uselist=False)

class Product(Base):
    __tablename__ = "products"
    
    product_id = Column(Integer, primary_key=True, autoincrement=True)
    product_name = Column(String(150), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    product_type = Column(String(50), nullable=False)
    created_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    
    transactions = relationship("Transaction", back_populates="product")

class Transaction(Base):
    __tablename__ = "transactions"
    
    transaction_id = Column(Integer, primary_key=True, autoincrement=True)
    pan_id = Column(String(20), ForeignKey("shops.pan_id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.product_id"), nullable=False)
    product_name = Column(String(150), nullable=False)
    price = Column(DECIMAL(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False)
    txn_date = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    
    shop = relationship("Shop", back_populates="transactions")
    product = relationship("Product", back_populates="transactions")

class Reward(Base):
    __tablename__ = "rewards"
    
    pan_id = Column(String(20), ForeignKey("shops.pan_id"), primary_key=True)
    reward_points = Column(Integer, default=0, nullable=False)
    
    shop = relationship("Shop", back_populates="rewards")

class BusinessOwner(Base):
    """
    BusinessOwner model for product producers with subscription tiers
    """
    __tablename__ = "business_owners"
    
    owner_id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    company_name = Column(String(200), nullable=False)
    citizenship_no = Column(String(50), nullable=False)
    contact_no = Column(String(20), nullable=False)
    subscription_tier = Column(Enum(SubscriptionTier), default=SubscriptionTier.FREE)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    def __repr__(self):
        return f"<BusinessOwner(owner_id={self.owner_id}, email='{self.email}', company_name='{self.company_name}', citizenship_no='{self.citizenship_no}', contact_no='{self.contact_no}')>"
