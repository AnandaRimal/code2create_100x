from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate
from typing import Optional, List
from fastapi import HTTPException, status
# Add this import at the top
from app.crud import inventory as crud_inventory

# Update create_product function
def create_product(db: Session, product: ProductCreate, shop_id: str) -> Product:
    """Create new product for a shop"""
    
    db_product = Product(
        shop_id=shop_id,
        product_name=product.product_name,
        category=product.category,
        price=product.price,
        unit=product.unit,
        quantity=product.quantity if hasattr(product, 'quantity') else 0
    )
    
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    
    # Initialize inventory with opening stock (sync with quantity)
    opening_stock = product.opening_stock if hasattr(product, 'opening_stock') else db_product.quantity
    if opening_stock > 0 or hasattr(product, 'opening_stock'):
        crud_inventory.create_inventory_with_opening_stock(
            db,
            shop_id,
            str(db_product.product_id),
            opening_stock,
            product.reorder_level if hasattr(product, 'reorder_level') else 10
        )
    
    return db_product

def get_product_by_id(db: Session, product_id: str, shop_id: str) -> Optional[Product]:
    """Get product by ID (only if it belongs to the shop)"""
    return db.query(Product).filter(
        and_(
            Product.product_id == product_id,
            Product.shop_id == shop_id,
            Product.is_active == True
        )
    ).first()

def get_products_by_shop(
    db: Session, 
    shop_id: str, 
    skip: int = 0, 
    limit: int = 100,
    search: Optional[str] = None,
    category: Optional[str] = None,
    include_inactive: bool = False
) -> tuple[List[Product], int]:
    """Get all products for a shop with pagination and filters"""
    
    query = db.query(Product).filter(Product.shop_id == shop_id)
    
    # Filter by active status
    if not include_inactive:
        query = query.filter(Product.is_active == True)
    
    # Search by product name
    if search:
        query = query.filter(Product.product_name.ilike(f"%{search}%"))
    
    # Filter by category
    if category:
        query = query.filter(Product.category == category)
    
    # Get total count
    total = query.count()
    
    # Get paginated results
    products = query.order_by(Product.created_at.desc()).offset(skip).limit(limit).all()
    
    return products, total

def update_product(
    db: Session, 
    product_id: str, 
    shop_id: str, 
    product_update: ProductUpdate
) -> Product:
    """Update product details"""
    
    db_product = get_product_by_id(db, product_id, shop_id)
    
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Update only provided fields
    update_data = product_update.dict(exclude_unset=True)
    
    # If quantity is being updated, sync with inventory
    if 'quantity' in update_data:
        new_quantity = update_data['quantity']
        old_quantity = db_product.quantity
        quantity_change = new_quantity - old_quantity
        
        if quantity_change != 0:
            # Update inventory to match
            crud_inventory.adjust_inventory(
                db,
                shop_id,
                product_id,
                quantity_change,
                notes=f"Manual adjustment via product update"
            )
    
    for key, value in update_data.items():
        setattr(db_product, key, value)
    
    # Increment version for conflict resolution
    db_product.version += 1
    
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: str, shop_id: str, soft_delete: bool = True) -> bool:
    """Delete product (soft or hard delete)"""
    
    db_product = db.query(Product).filter(
        and_(
            Product.product_id == product_id,
            Product.shop_id == shop_id
        )
    ).first()
    
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if soft_delete:
        # Soft delete - mark as inactive
        db_product.is_active = False
        db.commit()
    else:
        # Hard delete - permanently remove
        # Check if product has transactions first
        if db_product.transactions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete product with existing transactions. Use soft delete instead."
            )
        db.delete(db_product)
        db.commit()
    
    return True

def restore_product(db: Session, product_id: str, shop_id: str) -> Product:
    """Restore soft-deleted product"""
    
    db_product = db.query(Product).filter(
        and_(
            Product.product_id == product_id,
            Product.shop_id == shop_id,
            Product.is_active == False
        )
    ).first()
    
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deleted product not found"
        )
    
    db_product.is_active = True
    db.commit()
    db.refresh(db_product)
    return db_product

def get_categories_by_shop(db: Session, shop_id: str) -> List[str]:
    """Get unique categories used by a shop"""
    categories = db.query(Product.category).filter(
        and_(
            Product.shop_id == shop_id,
            Product.is_active == True,
            Product.category.isnot(None)
        )
    ).distinct().all()
    
    return [cat[0] for cat in categories if cat[0]]