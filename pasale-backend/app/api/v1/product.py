from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse
)
from app.crud import product as crud_product
from app.utils.dependencies import get_current_shopkeeper
from app.models.shopkeeper import Shopkeeper

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product: ProductCreate,
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Create a new product"""
    db_product = crud_product.create_product(
        db, 
        product, 
        str(current_shopkeeper.shop_id)
    )
    return db_product

# IMPORTANT: More specific routes (with paths) should come BEFORE generic ones
@router.get("/categories", response_model=list[str])
def list_categories(
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Get all categories used by current shop"""
    categories = crud_product.get_categories_by_shop(
        db,
        str(current_shopkeeper.shop_id)
    )
    return categories

@router.get("/", response_model=ProductListResponse)
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=1000),  # Increased limit to 1000
    search: Optional[str] = Query(None, max_length=100),
    category: Optional[str] = Query(None, max_length=100),
    include_inactive: bool = Query(False),
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """List all products for current shop with pagination and filters"""
    
    skip = (page - 1) * page_size
    
    products, total = crud_product.get_products_by_shop(
        db,
        str(current_shopkeeper.shop_id),
        skip=skip,
        limit=page_size,
        search=search,
        category=category,
        include_inactive=include_inactive
    )
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "products": products
    }

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: str,
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Get single product details"""
    db_product = crud_product.get_product_by_id(
        db,
        product_id,
        str(current_shopkeeper.shop_id)
    )
    
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return db_product

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Update product details"""
    db_product = crud_product.update_product(
        db,
        product_id,
        str(current_shopkeeper.shop_id),
        product_update
    )
    return db_product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: str,
    hard_delete: bool = Query(False, description="Permanently delete product"),
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Delete product (soft delete by default)"""
    crud_product.delete_product(
        db,
        product_id,
        str(current_shopkeeper.shop_id),
        soft_delete=not hard_delete
    )
    return None

@router.post("/{product_id}/restore", response_model=ProductResponse)
def restore_product(
    product_id: str,
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Restore soft-deleted product"""
    db_product = crud_product.restore_product(
        db,
        product_id,
        str(current_shopkeeper.shop_id)
    )
    return db_product