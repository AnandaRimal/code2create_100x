from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.security import verify_token
from app.crud.shopkeeper import get_shopkeeper_by_id
from app.models.shopkeeper import Shopkeeper

security = HTTPBearer()

def get_current_shopkeeper(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Shopkeeper:
    """Dependency to get current authenticated shopkeeper"""
    
    token = credentials.credentials
    payload = verify_token(token)
    
    # Debug: log token payload shape when troubleshooting type issues
    # (temporary — remove once root cause is found)
    print("DEBUG get_current_shopkeeper payload:", repr(payload))

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    shop_id: str = payload.get("sub")
    print("DEBUG extracted shop_id:", repr(shop_id), "type:", type(shop_id))

    # Normalize shop_id: accept a few common shapes (string or dict containing id)
    if not isinstance(shop_id, str):
        # If payload used a nested structure, try common keys
        if isinstance(shop_id, dict):
            for k in ("shop_id", "id", "sub"):
                if k in shop_id:
                    shop_id = shop_id[k]
                    break
        # Coerce to string as a last resort
        if not isinstance(shop_id, str):
            shop_id = str(shop_id)
    if shop_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    shopkeeper = get_shopkeeper_by_id(db, shop_id)
    if shopkeeper is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Shopkeeper not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return shopkeeper