from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.shopkeeper import (
    ShopkeeperCreate,
    ShopkeeperLogin,
    ShopkeeperResponse,
    ShopkeeperUpdate,
    Token
)
from app.crud import shopkeeper as crud_shopkeeper
from app.utils.security import create_access_token
from app.utils.dependencies import get_current_shopkeeper
from app.models.shopkeeper import Shopkeeper

router = APIRouter(prefix="/shopkeepers", tags=["Shopkeepers"])

@router.post("/register", response_model=ShopkeeperResponse, status_code=status.HTTP_201_CREATED)
def register_shopkeeper(
    shopkeeper: ShopkeeperCreate,
    db: Session = Depends(get_db)
):
    """Register a new shopkeeper"""
    db_shopkeeper = crud_shopkeeper.create_shopkeeper(db, shopkeeper)
    return db_shopkeeper

@router.post("/login", response_model=Token)
def login_shopkeeper(
    login_data: ShopkeeperLogin,
    db: Session = Depends(get_db)
):
    """Login shopkeeper and return access token"""
    shopkeeper = crud_shopkeeper.authenticate_shopkeeper(
        db, 
        login_data.identifier, 
        login_data.password
    )
    
    if not shopkeeper:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/contact or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(shopkeeper.shop_id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "shopkeeper": shopkeeper
    }

@router.get("/me", response_model=ShopkeeperResponse)
def get_my_profile(
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper)
):
    """Get current shopkeeper's profile"""
    return current_shopkeeper

@router.put("/me", response_model=ShopkeeperResponse)
def update_my_profile(
    shopkeeper_update: ShopkeeperUpdate,
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Update current shopkeeper's profile"""
    updated_shopkeeper = crud_shopkeeper.update_shopkeeper(
        db,
        str(current_shopkeeper.shop_id),
        shopkeeper_update
    )
    return updated_shopkeeper