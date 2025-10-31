from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, timedelta
from app.database import get_db
from app.schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionListResponse,
    TransactionBulkCreate,
    TransactionBulkCreateResponse,
    TransactionStats,
    TransactionType
)
from app.crud import transaction as crud_transaction
from app.utils.dependencies import get_current_shopkeeper
from app.models.shopkeeper import Shopkeeper

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction: TransactionCreate,
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Create a new transaction"""
    db_transaction = crud_transaction.create_transaction(
        db,
        transaction,
        str(current_shopkeeper.shop_id)
    )
    return db_transaction

@router.post("/bulk", response_model=TransactionBulkCreateResponse)
def bulk_create_transactions(
    bulk_data: TransactionBulkCreate,
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Bulk create transactions (for offline sync)"""
    
    created, errors = crud_transaction.bulk_create_transactions(
        db,
        bulk_data.transactions,
        str(current_shopkeeper.shop_id)
    )
    
    return {
        "created_count": len(created),
        "failed_count": len(errors),
        "created_transactions": created,
        "errors": errors
    }

@router.get("/", response_model=TransactionListResponse)
def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    product_id: Optional[str] = Query(None),
    transaction_type: Optional[TransactionType] = Query(None),
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """List transactions with filters and pagination"""
    
    skip = (page - 1) * page_size
    
    transactions, total = crud_transaction.get_transactions_by_shop(
        db,
        str(current_shopkeeper.shop_id),
        skip=skip,
        limit=page_size,
        start_date=start_date,
        end_date=end_date,
        product_id=product_id,
        transaction_type=transaction_type
    )
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "transactions": transactions
    }

@router.get("/stats", response_model=TransactionStats)
def get_transaction_statistics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    period: Optional[str] = Query("all", regex="^(today|week|month|all)$"),
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Get transaction statistics"""
    
    # Handle period shortcuts
    if period == "today":
        start_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        end_date = datetime.utcnow()
    elif period == "week":
        start_date = datetime.utcnow() - timedelta(days=7)
        end_date = datetime.utcnow()
    elif period == "month":
        start_date = datetime.utcnow() - timedelta(days=30)
        end_date = datetime.utcnow()
    
    stats = crud_transaction.get_transaction_statistics(
        db,
        str(current_shopkeeper.shop_id),
        start_date=start_date,
        end_date=end_date
    )
    
    return stats

@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction(
    transaction_id: str,
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Get single transaction details"""
    db_transaction = crud_transaction.get_transaction_by_id(
        db,
        transaction_id,
        str(current_shopkeeper.shop_id)
    )
    
    if not db_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return db_transaction

@router.put("/{transaction_id}", response_model=TransactionResponse)
def update_transaction(
    transaction_id: str,
    transaction_update: TransactionUpdate,
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Update transaction details"""
    db_transaction = crud_transaction.update_transaction(
        db,
        transaction_id,
        str(current_shopkeeper.shop_id),
        transaction_update
    )
    return db_transaction

@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: str,
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Delete transaction"""
    crud_transaction.delete_transaction(
        db,
        transaction_id,
        str(current_shopkeeper.shop_id)
    )
    return None