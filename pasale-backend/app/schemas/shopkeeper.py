from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
import re
import uuid
from pydantic import field_validator

# Base schema with common fields
class ShopkeeperBase(BaseModel):
    shop_name: str = Field(..., min_length=2, max_length=100)
    shop_address: str = Field(..., min_length=5, max_length=200)
    contact: str = Field(..., pattern=r"^(98|97)\d{8}$")  # Nepal mobile format
    email: Optional[EmailStr] = None
    pan: Optional[str] = Field(None, pattern=r"^\d{9}$")  # Nepal PAN: 9 digits

# For registration (input)
class ShopkeeperCreate(ShopkeeperBase):
    password: str = Field(..., min_length=6, max_length=50)
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        # bcrypt has a 72-byte input limit; ensure UTF-8 byte length doesn't exceed it
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password is too long; maximum 72 bytes when UTF-8 encoded')
        # You can add more rules: must contain number, special char, etc.
        return v

# For login (input)
class ShopkeeperLogin(BaseModel):
    identifier: str  # Can be email or contact
    password: str

# For response (output) - never expose password
class ShopkeeperResponse(ShopkeeperBase):
    shop_id: str
    created_at: datetime
    last_sync: Optional[datetime] = None
    
    class Config:
        from_attributes = True  # For SQLAlchemy compatibility

    # Accept uuid.UUID values coming from SQLAlchemy and coerce them to strings
    @field_validator("shop_id", mode="before")
    def _convert_uuid_to_str(cls, v):
        if isinstance(v, uuid.UUID):
            return str(v)
        return v

# For token response
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    shopkeeper: ShopkeeperResponse

# For profile update
class ShopkeeperUpdate(BaseModel):
    shop_name: Optional[str] = Field(None, min_length=2, max_length=100)
    shop_address: Optional[str] = Field(None, min_length=5, max_length=200)
    contact: Optional[str] = Field(None, pattern=r"^(98|97)\d{8}$")
    email: Optional[EmailStr] = None
    pan: Optional[str] = Field(None, pattern=r"^\d{9}$")