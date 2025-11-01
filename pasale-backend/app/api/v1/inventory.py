from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas.inventory import (
    InventoryResponse,
    InventoryListResponse,
    InventoryAdjustment,
    ReorderLevelUpdate,
    InventoryMovementResponse,
    InventoryMovementListResponse,
    StockAlert
)
from app.crud import inventory as crud_inventory
from app.utils.dependencies import get_current_shopkeeper
from app.models.shopkeeper import Shopkeeper

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/", response_model=InventoryListResponse)
def list_inventory(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    low_stock_only: bool = Query(False),
    out_of_stock_only: bool = Query(False),
    search: Optional[str] = Query(None),
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """List inventory with filters"""
    
    shop_id = str(current_shopkeeper.shop_id)
    skip = (page - 1) * page_size
    
    inventory_items, total = crud_inventory.get_inventory_for_shop(
        db,
        shop_id,
        skip=skip,
        limit=page_size,
        low_stock_only=low_stock_only,
        out_of_stock_only=out_of_stock_only,
        search=search
    )
    
    stats = crud_inventory.get_inventory_statistics(db, shop_id)
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_stock_value": stats["total_stock_value"],
        "low_stock_count": stats["low_stock_count"],
        "out_of_stock_count": stats["out_of_stock_count"],
        "inventory_items": inventory_items
    }

@router.get("/alerts", response_model=list[StockAlert])
def get_stock_alerts(
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Get stock alerts (low stock and out of stock items)"""
    
    shop_id = str(current_shopkeeper.shop_id)
    alerts = crud_inventory.get_stock_alerts(db, shop_id)
    
    return alerts

@router.get("/stats")
def get_inventory_stats(
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Get inventory statistics"""
    
    shop_id = str(current_shopkeeper.shop_id)
    stats = crud_inventory.get_inventory_statistics(db, shop_id)
    
    return stats

@router.get("/{product_id}", response_model=InventoryResponse)
def get_product_inventory(
    product_id: str,
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Get inventory for specific product"""
    
    shop_id = str(current_shopkeeper.shop_id)
    inventory = crud_inventory.get_product_inventory(db, shop_id, product_id)
    
    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found"
        )
    
    # Get product details
    from app.crud.product import get_product_by_id
    product = get_product_by_id(db, product_id, shop_id)
    
    stock_value = inventory.current_quantity * product.price if product else 0
    is_low_stock = inventory.current_quantity <= inventory.reorder_level
    
    return {
        "inventory_id": str(inventory.inventory_id),
        "shop_id": str(inventory.shop_id),
        "product_id": str(inventory.product_id),
        "product_name": product.product_name if product else None,
        "current_quantity": inventory.current_quantity,
        "reorder_level": inventory.reorder_level,
        "last_updated": inventory.last_updated,
        "is_low_stock": is_low_stock,
        "stock_value": round(stock_value, 2)
    }

@router.post("/adjust", response_model=InventoryResponse)
def adjust_inventory(
    adjustment: InventoryAdjustment,
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Manually adjust inventory"""
    
    shop_id = str(current_shopkeeper.shop_id)
    inventory = crud_inventory.adjust_inventory_manually(
        db,
        shop_id,
        adjustment,
        current_shopkeeper.email or current_shopkeeper.contact
    )
    
    # Get product details for response
    from app.crud.product import get_product_by_id
    product = get_product_by_id(db, adjustment.product_id, shop_id)
    
    stock_value = inventory.current_quantity * product.price if product else 0
    is_low_stock = inventory.current_quantity <= inventory.reorder_level
    
    return {
        "inventory_id": str(inventory.inventory_id),
        "shop_id": str(inventory.shop_id),
        "product_id": str(inventory.product_id),
        "product_name": product.product_name if product else None,
        "current_quantity": inventory.current_quantity,
        "reorder_level": inventory.reorder_level,
        "last_updated": inventory.last_updated,
        "is_low_stock": is_low_stock,
        "stock_value": round(stock_value, 2)
    }

@router.put("/{product_id}/reorder-level", response_model=InventoryResponse)
def update_reorder_level(
    product_id: str,
    update_data: ReorderLevelUpdate,
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Update reorder level for a product"""
    
    shop_id = str(current_shopkeeper.shop_id)
    inventory = crud_inventory.update_reorder_level(
        db,
        shop_id,
        product_id,
        update_data.reorder_level
    )
    
    # Get product details for response
    from app.crud.product import get_product_by_id
    product = get_product_by_id(db, product_id, shop_id)
    
    stock_value = inventory.current_quantity * product.price if product else 0
    is_low_stock = inventory.current_quantity <= inventory.reorder_level
    
    return {
        "inventory_id": str(inventory.inventory_id),
        "shop_id": str(inventory.shop_id),
        "product_id": str(inventory.product_id),
        "product_name": product.product_name if product else None,
        "current_quantity": inventory.current_quantity,
        "reorder_level": inventory.reorder_level,
        "last_updated": inventory.last_updated,
        "is_low_stock": is_low_stock,
        "stock_value": round(stock_value, 2)
    }

@router.get("/movements/history", response_model=InventoryMovementListResponse)
def get_inventory_movements(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    product_id: Optional[str] = Query(None),
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Get inventory movement history"""
    
    shop_id = str(current_shopkeeper.shop_id)
    skip = (page - 1) * page_size
    
    movements, total = crud_inventory.get_inventory_movements(
        db,
        shop_id,
        product_id=product_id,
        skip=skip,
        limit=page_size
    )
    
    # Enrich movements with product names
    from app.crud.product import get_product_by_id
    
    enriched_movements = []
    for movement in movements:
        product = get_product_by_id(db, str(movement.product_id), shop_id)
        
        enriched_movements.append({
            "movement_id": str(movement.movement_id),
            "shop_id": str(movement.shop_id),
            "product_id": str(movement.product_id),
            "product_name": product.product_name if product else None,
            "movement_type": movement.movement_type,
            "quantity_change": movement.quantity_change,
            "quantity_after": movement.quantity_after,
            "transaction_id": str(movement.transaction_id) if movement.transaction_id else None,
            "notes": movement.notes,
            "created_at": movement.created_at,
            "created_by": movement.created_by
        })
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "movements": enriched_movements
    }