from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, func, or_
from app.models.inventory import Inventory, InventoryMovement, MovementType
from app.models.product import Product
from app.models.transaction import TransactionType
from app.schemas.inventory import InventoryAdjustment
from typing import Optional, List, Tuple
from fastapi import HTTPException, status
from datetime import datetime

def get_or_create_inventory(db: Session, shop_id: str, product_id: str) -> Inventory:
    """Get inventory record or create if doesn't exist"""
    
    inventory = db.query(Inventory).filter(
        and_(
            Inventory.shop_id == shop_id,
            Inventory.product_id == product_id
        )
    ).first()
    
    if not inventory:
        # Create with 0 stock
        inventory = Inventory(
            shop_id=shop_id,
            product_id=product_id,
            current_quantity=0
        )
        db.add(inventory)
        db.commit()
        db.refresh(inventory)
    
    return inventory

def create_inventory_with_opening_stock(
    db: Session,
    shop_id: str,
    product_id: str,
    opening_stock: int,
    reorder_level: int = 10
) -> Inventory:
    """Create inventory record with opening stock"""
    
    # Check if inventory already exists
    existing = db.query(Inventory).filter(
        and_(
            Inventory.shop_id == shop_id,
            Inventory.product_id == product_id
        )
    ).first()
    
    if existing:
        return existing
    
    # Create inventory
    inventory = Inventory(
        shop_id=shop_id,
        product_id=product_id,
        current_quantity=opening_stock,
        reorder_level=reorder_level
    )
    db.add(inventory)
    db.commit()
    db.refresh(inventory)
    
    # Log opening stock movement
    if opening_stock > 0:
        movement = InventoryMovement(
            shop_id=shop_id,
            product_id=product_id,
            movement_type=MovementType.OPENING_STOCK,
            quantity_change=opening_stock,
            quantity_after=opening_stock,
            notes="Opening stock"
        )
        db.add(movement)
        db.commit()
    
    return inventory

def update_inventory_from_transaction(
    db: Session,
    shop_id: str,
    product_id: str,
    transaction_id: str,
    transaction_type: TransactionType,
    quantity: int
) -> Inventory:
    """Update inventory based on transaction"""
    
    inventory = get_or_create_inventory(db, shop_id, product_id)
    
    # Determine quantity change based on transaction type
    if transaction_type == TransactionType.SALE:
        quantity_change = -quantity  # Decrease stock
        movement_type = MovementType.SALE
    elif transaction_type == TransactionType.PURCHASE:
        quantity_change = quantity  # Increase stock
        movement_type = MovementType.PURCHASE
    elif transaction_type == TransactionType.RETURN:
        quantity_change = quantity  # Increase stock (customer returned)
        movement_type = MovementType.RETURN
    else:
        return inventory  # Unknown type, don't update
    
    # Update inventory
    inventory.current_quantity += quantity_change
    
    # Log movement
    movement = InventoryMovement(
        shop_id=shop_id,
        product_id=product_id,
        movement_type=movement_type,
        quantity_change=quantity_change,
        quantity_after=inventory.current_quantity,
        transaction_id=transaction_id,
        notes=f"Auto-update from {transaction_type.value} transaction"
    )
    db.add(movement)
    db.commit()
    db.refresh(inventory)
    
    return inventory

def reverse_inventory_from_transaction(
    db: Session,
    shop_id: str,
    product_id: str,
    transaction_id: str
) -> bool:
    """Reverse inventory changes when transaction is deleted"""
    
    # Find the movement associated with this transaction
    movement = db.query(InventoryMovement).filter(
        and_(
            InventoryMovement.shop_id == shop_id,
            InventoryMovement.product_id == product_id,
            InventoryMovement.transaction_id == transaction_id
        )
    ).first()
    
    if not movement:
        return False
    
    # Reverse the quantity change
    inventory = get_or_create_inventory(db, shop_id, product_id)
    inventory.current_quantity -= movement.quantity_change
    
    # Log reversal movement
    reversal = InventoryMovement(
        shop_id=shop_id,
        product_id=product_id,
        movement_type=MovementType.ADJUSTMENT,
        quantity_change=-movement.quantity_change,
        quantity_after=inventory.current_quantity,
        notes=f"Reversal for deleted transaction {transaction_id}"
    )
    db.add(reversal)
    db.commit()
    
    return True

def adjust_inventory_manually(
    db: Session,
    shop_id: str,
    adjustment: InventoryAdjustment,
    user_email: str
) -> Inventory:
    """Manually adjust inventory (for corrections, damage, theft, etc.)"""
    
    # Verify product exists and belongs to shop
    product = db.query(Product).filter(
        and_(
            Product.product_id == adjustment.product_id,
            Product.shop_id == shop_id,
            Product.is_active == True
        )
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    inventory = get_or_create_inventory(db, shop_id, adjustment.product_id)
    
    # Update quantity
    inventory.current_quantity += adjustment.quantity_change
    
    # Log movement
    movement = InventoryMovement(
        shop_id=shop_id,
        product_id=adjustment.product_id,
        movement_type=adjustment.movement_type,
        quantity_change=adjustment.quantity_change,
        quantity_after=inventory.current_quantity,
        notes=adjustment.notes,
        created_by=user_email
    )
    db.add(movement)
    db.commit()
    db.refresh(inventory)
    
    return inventory

def get_inventory_for_shop(
    db: Session,
    shop_id: str,
    skip: int = 0,
    limit: int = 100,
    low_stock_only: bool = False,
    out_of_stock_only: bool = False,
    search: Optional[str] = None
) -> Tuple[List[dict], int]:
    """Get inventory list with product details"""
    
    query = db.query(Inventory, Product).join(
        Product, Inventory.product_id == Product.product_id
    ).filter(
        and_(
            Inventory.shop_id == shop_id,
            Product.is_active == True
        )
    )
    
    # Search filter
    if search:
        query = query.filter(Product.product_name.ilike(f"%{search}%"))
    
    # Stock filters
    if low_stock_only:
        query = query.filter(Inventory.current_quantity <= Inventory.reorder_level)
    if out_of_stock_only:
        query = query.filter(Inventory.current_quantity <= 0)
    
    total = query.count()
    
    results = query.order_by(Inventory.current_quantity.asc()).offset(skip).limit(limit).all()
    
    # Format response
    inventory_items = []
    for inventory, product in results:
        stock_value = inventory.current_quantity * product.price
        is_low_stock = inventory.current_quantity <= inventory.reorder_level
        
        inventory_items.append({
            "inventory_id": str(inventory.inventory_id),
            "shop_id": str(inventory.shop_id),
            "product_id": str(inventory.product_id),
            "product_name": product.product_name,
            "current_quantity": inventory.current_quantity,
            "reorder_level": inventory.reorder_level,
            "last_updated": inventory.last_updated,
            "is_low_stock": is_low_stock,
            "stock_value": round(stock_value, 2)
        })
    
    return inventory_items, total

def get_inventory_statistics(db: Session, shop_id: str) -> dict:
    """Get inventory statistics"""
    
    # Get all inventory with products
    inventory_items = db.query(Inventory, Product).join(
        Product, Inventory.product_id == Product.product_id
    ).filter(
        and_(
            Inventory.shop_id == shop_id,
            Product.is_active == True
        )
    ).all()
    
    total_products = len(inventory_items)
    total_stock_value = sum(inv.current_quantity * prod.price for inv, prod in inventory_items)
    low_stock_count = sum(1 for inv, _ in inventory_items if inv.current_quantity <= inv.reorder_level)
    out_of_stock_count = sum(1 for inv, _ in inventory_items if inv.current_quantity <= 0)
    
    return {
        "total_products": total_products,
        "total_stock_value": round(total_stock_value, 2),
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count
    }

def get_stock_alerts(db: Session, shop_id: str) -> List[dict]:
    """Get products that need reordering"""
    
    alerts = db.query(Inventory, Product).join(
        Product, Inventory.product_id == Product.product_id
    ).filter(
        and_(
            Inventory.shop_id == shop_id,
            Product.is_active == True,
            Inventory.current_quantity <= Inventory.reorder_level
        )
    ).all()
    
    stock_alerts = []
    for inventory, product in alerts:
        if inventory.current_quantity <= 0:
            status = "out_of_stock"
            suggested_qty = inventory.reorder_level * 2
        else:
            status = "low_stock"
            suggested_qty = inventory.reorder_level - inventory.current_quantity
        
        stock_alerts.append({
            "product_id": str(inventory.product_id),
            "product_name": product.product_name,
            "current_quantity": inventory.current_quantity,
            "reorder_level": inventory.reorder_level,
            "stock_status": status,
            "suggested_order_quantity": suggested_qty
        })
    
    return stock_alerts

def update_reorder_level(
    db: Session,
    shop_id: str,
    product_id: str,
    reorder_level: int
) -> Inventory:
    """Update reorder level for a product"""
    
    inventory = db.query(Inventory).filter(
        and_(
            Inventory.shop_id == shop_id,
            Inventory.product_id == product_id
        )
    ).first()
    
    if not inventory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inventory record not found"
        )
    
    inventory.reorder_level = reorder_level
    db.commit()
    db.refresh(inventory)
    
    return inventory

def get_inventory_movements(
    db: Session,
    shop_id: str,
    product_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> Tuple[List[InventoryMovement], int]:
    """Get inventory movement history"""
    
    query = db.query(InventoryMovement).filter(
        InventoryMovement.shop_id == shop_id
    )
    
    if product_id:
        query = query.filter(InventoryMovement.product_id == product_id)
    
    total = query.count()
    movements = query.order_by(InventoryMovement.created_at.desc()).offset(skip).limit(limit).all()
    
    return movements, total

def get_product_inventory(db: Session, shop_id: str, product_id: str) -> Optional[Inventory]:
    """Get inventory for a specific product"""
    
    return db.query(Inventory).filter(
        and_(
            Inventory.shop_id == shop_id,
            Inventory.product_id == product_id
        )
    ).first()