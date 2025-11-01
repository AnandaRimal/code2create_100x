from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

# Common product categories in Nepal
class ProductCategory(str, Enum):
    FOOD_BEVERAGE = "Food & Beverage"
    SNACKS = "Snacks"
    DAIRY = "Dairy Products"
    PERSONAL_CARE = "Personal Care"
    HOUSEHOLD = "Household Items"
    STATIONERY = "Stationery"
    TOBACCO = "Tobacco Products"
    BEVERAGES = "Beverages"
    CONFECTIONERY = "Confectionery"
    OTHER = "Other"

# Base schema
class ProductBase(BaseModel):
    product_name: str = Field(..., min_length=1, max_length=200)
    category: Optional[str] = None
    price: float = Field(..., gt=0)  # Must be greater than 0
    unit: Optional[str] = Field(default="piece", max_length=50)  # piece, kg, liter, packet, etc.
    
    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('Price must be greater than 0')
        # Round to 2 decimal places
        return round(v, 2)

# For creating product
class ProductCreate(ProductBase):
    opening_stock: Optional[int] = Field(default=0, ge=0)
    reorder_level: Optional[int] = Field(default=10, ge=0)

# For updating product (all fields optional)
class ProductUpdate(BaseModel):
    product_name: Optional[str] = Field(None, min_length=1, max_length=200)
    category: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    unit: Optional[str] = Field(None, max_length=50)
    
    @validator('price')
    def validate_price(cls, v):
        if v is not None:
            if v <= 0:
                raise ValueError('Price must be greater than 0')
            return round(v, 2)
        return v

# For response
class ProductResponse(ProductBase):
    product_id: str
    shop_id: str
    created_at: datetime
    updated_at: datetime
    version: int
    is_active: bool
    current_stock: Optional[int] = None  # Will be populated from inventory
    reorder_level: Optional[int] = None
    stock_value: Optional[float] = None  # current_stock * price
    
    class Config:
        from_attributes = True

# For list response with pagination
class ProductListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    products: list[ProductResponse]

    