from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.inventory import MovementType

# Base inventory schema
class InventoryBase(BaseModel):
    current_quantity: int
    reorder_level: int = 10

# For response
class InventoryResponse(BaseModel):
    inventory_id: str
    shop_id: str
    product_id: str
    product_name: Optional[str] = None  # Populated from join
    current_quantity: int
    reorder_level: int
    last_updated: datetime
    is_low_stock: bool = False  # Calculated field
    stock_value: float = 0.0  # quantity × price
    
    class Config:
        from_attributes = True

# For inventory list
class InventoryListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_stock_value: float
    low_stock_count: int
    out_of_stock_count: int
    inventory_items: list[InventoryResponse]

# For manual adjustment
class InventoryAdjustment(BaseModel):
    product_id: str
    quantity_change: int  # Can be positive or negative
    movement_type: MovementType = MovementType.ADJUSTMENT
    notes: Optional[str] = None

# For setting reorder level
class ReorderLevelUpdate(BaseModel):
    reorder_level: int = Field(..., ge=0)

# Movement response
class InventoryMovementResponse(BaseModel):
    movement_id: str
    shop_id: str
    product_id: str
    product_name: Optional[str] = None
    movement_type: MovementType
    quantity_change: int
    quantity_after: int
    transaction_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    created_by: Optional[str] = None
    
    class Config:
        from_attributes = True

# For movement history list
class InventoryMovementListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    movements: list[InventoryMovementResponse]

# For stock alerts
class StockAlert(BaseModel):
    product_id: str
    product_name: str
    current_quantity: int
    reorder_level: int
    stock_status: str  # "low_stock", "out_of_stock"
    suggested_order_quantity: int