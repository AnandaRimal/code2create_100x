from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class TransactionType(str, Enum):
    SALE = "sale"
    PURCHASE = "purchase"
    RETURN = "return"

# Base schema
class TransactionBase(BaseModel):
    product_id: str
    quantity: int = Field(..., gt=0)
    price: float = Field(..., gt=0)
    type: TransactionType = TransactionType.SALE
    date_time: Optional[datetime] = None  # Allow client to set time for offline transactions
    device_id: Optional[str] = None
    
    @validator('quantity')
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v
    
    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than 0')
        return round(v, 2)

# For creating transaction
class TransactionCreate(TransactionBase):
    pass

# For bulk creating transactions (sync)
class TransactionBulkCreate(BaseModel):
    transactions: list[TransactionCreate]

# For updating transaction
class TransactionUpdate(BaseModel):
    product_id: Optional[str] = None
    quantity: Optional[int] = Field(None, gt=0)
    price: Optional[float] = Field(None, gt=0)
    type: Optional[TransactionType] = None
    date_time: Optional[datetime] = None
    
    @validator('quantity')
    def validate_quantity(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Quantity must be greater than 0')
        return v
    
    @validator('price')
    def validate_price(cls, v):
        if v is not None:
            if v <= 0:
                raise ValueError('Price must be greater than 0')
            return round(v, 2)
        return v

# For response (includes product details)
class TransactionResponse(BaseModel):
    transaction_id: str
    shop_id: str
    product_id: Optional[str]
    product_name: Optional[str] = None  # Denormalized for display
    date_time: datetime
    quantity: int
    price: float
    total: float
    type: TransactionType
    synced: bool
    device_id: Optional[str]
    version: int
    
    class Config:
        from_attributes = True

# For list response with pagination
class TransactionListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    transactions: list[TransactionResponse]

# For bulk create response
class TransactionBulkCreateResponse(BaseModel):
    created_count: int
    failed_count: int
    created_transactions: list[TransactionResponse]
    errors: list[dict] = []

# For transaction statistics
class TransactionStats(BaseModel):
    total_transactions: int
    total_sales: float
    total_purchases: float
    total_returns: float
    net_revenue: float  # sales - returns
    transaction_count_by_type: dict[str, int]
    top_products: list[dict]  # [{product_name, quantity, revenue}]

# Date range filter
class DateRangeFilter(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None