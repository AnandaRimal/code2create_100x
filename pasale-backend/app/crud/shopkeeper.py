from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.models.shopkeeper import Shopkeeper
from app.schemas.shopkeeper import ShopkeeperCreate, ShopkeeperUpdate
from app.utils.security import hash_password, verify_password, pwd_context
from typing import Optional
from fastapi import HTTPException, status

def get_shopkeeper_by_id(db: Session, shop_id: str) -> Optional[Shopkeeper]:
    """Get shopkeeper by shop_id"""
    return db.query(Shopkeeper).filter(Shopkeeper.shop_id == shop_id).first()

def get_shopkeeper_by_email(db: Session, email: str) -> Optional[Shopkeeper]:
    """Get shopkeeper by email"""
    return db.query(Shopkeeper).filter(Shopkeeper.email == email).first()

def get_shopkeeper_by_contact(db: Session, contact: str) -> Optional[Shopkeeper]:
    """Get shopkeeper by contact number"""
    return db.query(Shopkeeper).filter(Shopkeeper.contact == contact).first()

def get_shopkeeper_by_identifier(db: Session, identifier: str) -> Optional[Shopkeeper]:
    """Get shopkeeper by email or contact"""
    shopkeeper = get_shopkeeper_by_email(db, identifier)
    if not shopkeeper:
        shopkeeper = get_shopkeeper_by_contact(db, identifier)
    return shopkeeper

def create_shopkeeper(db: Session, shopkeeper: ShopkeeperCreate) -> Shopkeeper:
    """Create new shopkeeper"""
    
    # Check if email already exists
    if shopkeeper.email:
        existing = get_shopkeeper_by_email(db, shopkeeper.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Check if contact already exists
    existing = get_shopkeeper_by_contact(db, shopkeeper.contact)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contact number already registered"
        )
    
    # Check if PAN already exists (if provided)
    if shopkeeper.pan:
        existing = db.query(Shopkeeper).filter(Shopkeeper.pan == shopkeeper.pan).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PAN already registered"
            )
    
    # Create shopkeeper
    hashed_password = hash_password(shopkeeper.password)
    
    db_shopkeeper = Shopkeeper(
        shop_name=shopkeeper.shop_name,
        shop_address=shopkeeper.shop_address,
        contact=shopkeeper.contact,
        email=shopkeeper.email,
        pan=shopkeeper.pan,
        password=hashed_password
    )
    
    try:
        db.add(db_shopkeeper)
        db.commit()
        db.refresh(db_shopkeeper)
        return db_shopkeeper
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed. Please check your details."
        )

def authenticate_shopkeeper(db: Session, identifier: str, password: str) -> Optional[Shopkeeper]:
    """Authenticate shopkeeper with email/contact and password"""
    shopkeeper = get_shopkeeper_by_identifier(db, identifier)
    
    if not shopkeeper:
        return None
    
    if not verify_password(password, shopkeeper.password):
        return None

    # If the stored hash needs an upgrade (e.g. bcrypt -> argon2), re-hash and update it.
    try:
        if pwd_context.needs_update(shopkeeper.password):
            new_hash = hash_password(password)
            shopkeeper.password = new_hash
            db.add(shopkeeper)
            db.commit()
            db.refresh(shopkeeper)
    except Exception:
        # If re-hash/update fails, don't block authentication; just rollback and continue
        try:
            db.rollback()
        except Exception:
            pass

    return shopkeeper

def update_shopkeeper(db: Session, shop_id: str, shopkeeper_update: ShopkeeperUpdate) -> Shopkeeper:
    """Update shopkeeper details"""
    db_shopkeeper = get_shopkeeper_by_id(db, shop_id)
    
    if not db_shopkeeper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shopkeeper not found"
        )
    
    # Update only provided fields
    update_data = shopkeeper_update.dict(exclude_unset=True)
    
    # Check for unique constraints if updating email/contact/pan
    if "email" in update_data and update_data["email"]:
        existing = get_shopkeeper_by_email(db, update_data["email"])
        if existing and existing.shop_id != shop_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
    
    if "contact" in update_data:
        existing = get_shopkeeper_by_contact(db, update_data["contact"])
        if existing and existing.shop_id != shop_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Contact number already in use"
            )
    
    if "pan" in update_data and update_data["pan"]:
        existing = db.query(Shopkeeper).filter(Shopkeeper.pan == update_data["pan"]).first()
        if existing and existing.shop_id != shop_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PAN already in use"
            )
    
    for key, value in update_data.items():
        setattr(db_shopkeeper, key, value)
    
    try:
        db.commit()
        db.refresh(db_shopkeeper)
        return db_shopkeeper
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Update failed. Please check your details."
        )