from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
from app.models.transaction import Transaction, TransactionType
from app.models.product import Product
from app.schemas.transaction import TransactionCreate, TransactionUpdate
from typing import Optional, List, Tuple
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from app.crud import inventory as crud_inventory
# Lazy import to avoid circular dependency
# from app.crud import fraud as crud_fraud
# Add this import at the top
from app.crud import reward as crud_reward
def create_transaction(
    db: Session, 
    transaction: TransactionCreate, 
    shop_id: str
) -> Transaction:
    """Create new transaction"""
    
    # Verify product exists and belongs to shop
    product = db.query(Product).filter(
        and_(
            Product.product_id == transaction.product_id,
            Product.shop_id == shop_id,
            Product.is_active == True
        )
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or doesn't belong to your shop"
        )
    
    # Calculate total
    total = transaction.quantity * transaction.price
    
    # Use provided date_time or current time
    transaction_time = transaction.date_time if transaction.date_time else datetime.utcnow()
    
    db_transaction = Transaction(
        shop_id=shop_id,
        product_id=transaction.product_id,
        date_time=transaction_time,
        quantity=transaction.quantity,
        price=transaction.price,
        total=total,
        type=transaction.type,
        device_id=transaction.device_id,
        synced=True  # Created on server, so already synced
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)

    # RUN FRAUD DETECTION (lazy import to avoid circular dependency)
    try:
        from app.crud import fraud as crud_fraud
        fraud_alerts = crud_fraud.run_all_fraud_checks(
            db,
            shop_id,
            str(db_transaction.transaction_id),
            transaction.product_id,
            transaction.quantity,
            transaction.price,
            db_transaction.date_time
        )
        
        if fraud_alerts:
            print(f"⚠️ FRAUD ALERT: {len(fraud_alerts)} alerts for transaction {db_transaction.transaction_id}")
    except Exception as e:
        print(f"Fraud detection failed: {e}")
    
   # Update inventory
    try:
        crud_inventory.update_inventory_from_transaction(
            db,
            shop_id,
            transaction.product_id,
            str(db_transaction.transaction_id),
            db_transaction.type,
            transaction.quantity
        )
    except Exception as e:
        print(f"Failed to update inventory: {e}")
    
    # Award points for transaction
    try:
        crud_reward.award_transaction_points(
            db,
            shop_id,
            str(db_transaction.transaction_id),
            db_transaction.type
        )
    except Exception as e:
        print(f"Failed to award points: {e}")
    # TODO: Trigger reward calculation here
    # from app.crud.reward import calculate_and_award_points
    # calculate_and_award_points(db, shop_id, db_transaction)
    
    return db_transaction

def bulk_create_transactions(
    db: Session,
    transactions: List[TransactionCreate],
    shop_id: str
) -> Tuple[List[Transaction], List[dict]]:
    """Bulk create transactions (for sync from mobile)"""
    
    created_transactions = []
    errors = []
    
    for idx, transaction in enumerate(transactions):
        try:
            # Verify product exists
            product = db.query(Product).filter(
                and_(
                    Product.product_id == transaction.product_id,
                    Product.shop_id == shop_id
                )
            ).first()
            
            if not product:
                errors.append({
                    "index": idx,
                    "error": f"Product {transaction.product_id} not found"
                })
                continue
            
            # Calculate total
            total = transaction.quantity * transaction.price
            
            # Use provided date_time or current time
            transaction_time = transaction.date_time if transaction.date_time else datetime.utcnow()
            
            db_transaction = Transaction(
                shop_id=shop_id,
                product_id=transaction.product_id,
                date_time=transaction_time,
                quantity=transaction.quantity,
                price=transaction.price,
                total=total,
                type=transaction.type,
                device_id=transaction.device_id,
                synced=True  # Now synced to server
            )
            
            db.add(db_transaction)
            created_transactions.append(db_transaction)
            
        except Exception as e:
            errors.append({
                "index": idx,
                "error": str(e)
            })
    
    if created_transactions:
        db.commit()
        for txn in created_transactions:
            db.refresh(txn)
    
    return created_transactions, errors

def get_transaction_by_id(
    db: Session, 
    transaction_id: str, 
    shop_id: str
) -> Optional[Transaction]:
    """Get transaction by ID (only if it belongs to the shop)"""
    return db.query(Transaction).filter(
        and_(
            Transaction.transaction_id == transaction_id,
            Transaction.shop_id == shop_id
        )
    ).first()

def get_transactions_by_shop(
    db: Session,
    shop_id: str,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    product_id: Optional[str] = None,
    transaction_type: Optional[TransactionType] = None
) -> Tuple[List[Transaction], int]:
    """Get transactions with filters and pagination"""
    
    query = db.query(Transaction).filter(Transaction.shop_id == shop_id)
    
    # Date range filter
    if start_date:
        query = query.filter(Transaction.date_time >= start_date)
    if end_date:
        query = query.filter(Transaction.date_time <= end_date)
    
    # Product filter
    if product_id:
        query = query.filter(Transaction.product_id == product_id)
    
    # Transaction type filter
    if transaction_type:
        query = query.filter(Transaction.type == transaction_type)
    
    # Get total count
    total = query.count()
    
    # Get paginated results (most recent first)
    transactions = query.order_by(desc(Transaction.date_time)).offset(skip).limit(limit).all()
    
    return transactions, total

def update_transaction(
    db: Session,
    transaction_id: str,
    shop_id: str,
    transaction_update: TransactionUpdate
) -> Transaction:
    """Update transaction details"""
    
    db_transaction = get_transaction_by_id(db, transaction_id, shop_id)
    
    if not db_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Update only provided fields
    update_data = transaction_update.dict(exclude_unset=True)
    
    # If product_id is being changed, verify it exists
    if "product_id" in update_data:
        product = db.query(Product).filter(
            and_(
                Product.product_id == update_data["product_id"],
                Product.shop_id == shop_id,
                Product.is_active == True
            )
        ).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
    
    # Update fields
    for key, value in update_data.items():
        setattr(db_transaction, key, value)
    
    # Recalculate total if quantity or price changed
    if "quantity" in update_data or "price" in update_data:
        db_transaction.total = db_transaction.quantity * db_transaction.price
    
    # Increment version
    db_transaction.version += 1
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def delete_transaction(
    db: Session,
    transaction_id: str,
    shop_id: str
) -> bool:
    """Delete transaction"""
    
    db_transaction = get_transaction_by_id(db, transaction_id, shop_id)
    
    if not db_transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    # Reverse inventory changes
    try:
        crud_inventory.reverse_inventory_from_transaction(
            db,
            shop_id,
            str(db_transaction.product_id),
            transaction_id
        )
    except Exception as e:
        print(f"Failed to reverse inventory: {e}")
    try:
        crud_reward.reverse_transaction_rewards(db, transaction_id)
    except Exception as e:
        print(f"Failed to reverse rewards: {e}")
    
    # TODO: Reverse rewards if any were given
    # from app.crud.reward import reverse_transaction_rewards
    # reverse_transaction_rewards(db, transaction_id)
    
    db.delete(db_transaction)
    db.commit()
    return True

def get_transaction_statistics(
    db: Session,
    shop_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
) -> dict:
    """Get transaction statistics for a shop"""
    
    query = db.query(Transaction).filter(Transaction.shop_id == shop_id)
    
    # Apply date filters
    if start_date:
        query = query.filter(Transaction.date_time >= start_date)
    if end_date:
        query = query.filter(Transaction.date_time <= end_date)
    
    # Get all transactions for analysis
    transactions = query.all()
    
    # Calculate statistics
    total_transactions = len(transactions)
    total_sales = sum(t.total for t in transactions if t.type == TransactionType.SALE)
    total_purchases = sum(t.total for t in transactions if t.type == TransactionType.PURCHASE)
    total_returns = sum(t.total for t in transactions if t.type == TransactionType.RETURN)
    net_revenue = total_sales - total_returns
    
    # Count by type
    transaction_count_by_type = {
        "sale": sum(1 for t in transactions if t.type == TransactionType.SALE),
        "purchase": sum(1 for t in transactions if t.type == TransactionType.PURCHASE),
        "return": sum(1 for t in transactions if t.type == TransactionType.RETURN)
    }
    
    # Top products (only sales)
    product_stats = {}
    for t in transactions:
        if t.type == TransactionType.SALE and t.product:
            if t.product_id not in product_stats:
                product_stats[t.product_id] = {
                    "product_id": str(t.product_id),
                    "product_name": t.product.product_name,
                    "quantity": 0,
                    "revenue": 0.0
                }
            product_stats[t.product_id]["quantity"] += t.quantity
            product_stats[t.product_id]["revenue"] += t.total
    
    # Sort by revenue and get top 10
    top_products = sorted(
        product_stats.values(),
        key=lambda x: x["revenue"],
        reverse=True
    )[:10]
    
    return {
        "total_transactions": total_transactions,
        "total_sales": round(total_sales, 2),
        "total_purchases": round(total_purchases, 2),
        "total_returns": round(total_returns, 2),
        "net_revenue": round(net_revenue, 2),
        "transaction_count_by_type": transaction_count_by_type,
        "top_products": top_products
    }
