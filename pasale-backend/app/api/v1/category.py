from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.dependencies import get_current_shopkeeper
from app.models.shopkeeper import Shopkeeper
from app.models.product import Product
from sqlalchemy import distinct

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/categories")
def get_categories(
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Get unique categories for current shop"""
    categories = db.query(distinct(Product.category)).filter(
        Product.shop_id == str(current_shopkeeper.shop_id),
        Product.is_active == True
    ).all()
    
    return [category[0] for category in categories if category[0]]