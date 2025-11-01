"""
FastAPI main application for the Pasale backend.
Provides REST API endpoints for:
1. Shop management, products, transactions, and rewards (for Flutter app)
2. Product producer analytics and AI insights (for Next.js frontend)
"""
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta
from contextlib import asynccontextmanager

from database import get_db, create_tables
from models import Shop, Product, Transaction, Reward
from schemas import (
    UserRegister, UserLogin, ShopResponse, Token,
    ProductCreate, ProductUpdate, ProductResponse,
    TransactionCreate, TransactionBatch, TransactionResponse,
    ShopRewardResponse, APIResponse, TransactionSyncResponse
)
from auth import authenticate_shop, create_access_token, get_current_shop, ACCESS_TOKEN_EXPIRE_MINUTES
from crud import (
    create_shop, get_shop_by_pan_id, get_shop_by_email, get_shop_by_ctzn_no,
    create_product, get_products, get_product_by_id, update_product, delete_product,
    create_transaction, create_batch_transactions, get_transactions_by_shop,
    get_reward_by_pan_id
)

# Import business owner routes
from business_owner_simple import router as business_owner_router
from analytics_ai import router as analytics_router

# Import scheduler for automated tasks
from scheduler import start_scheduler, stop_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan events"""
    # Startup
    print("🚀 Starting Pasale Backend...")
    print("📋 Initializing database tables...")
    create_tables()
    print("⏰ Starting automated scheduler (rewards + analytics)...")
    start_scheduler()
    print("✅ Pasale Backend ready!")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down Pasale Backend...")
    stop_scheduler()
    print("✅ Shutdown complete!")

# Initialize FastAPI app with lifespan management
app = FastAPI(
    title="Pasale Backend API",
    description="Backend API for Pasale - Shop Management (Flutter) and Product Producer Analytics (Next.js)",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware for both Flutter app and Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include business owner routes
app.include_router(business_owner_router)
app.include_router(analytics_router)

# Security scheme
security = HTTPBearer()

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    """Create database tables on application startup."""
    create_tables()

# Root endpoint for testing
@app.get("/")
async def root():
    """Root endpoint to test API availability"""
    return {
        "message": "Pasale Backend API is running",
        "version": "2.0.0",
        "systems": {
            "shopkeeper_api": "Available for Flutter app",
            "product_producer_api": "Available for Next.js frontend"
        }
    }

# Dependency to get current authenticated shop
async def get_current_authenticated_shop(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> Shop:
    """
    Dependency to get current authenticated shop from JWT token.
    
    Args:
        credentials: HTTP authorization credentials
        db: Database session
    
    Returns:
        Authenticated shop object
    
    Raises:
        HTTPException: If authentication fails
    """
    shop = get_current_shop(db, credentials.credentials)
    if shop is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return shop

# Authentication endpoints
@app.post("/register", response_model=APIResponse, status_code=status.HTTP_201_CREATED)
async def register_shop(shop_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new shop.
    
    Args:
        shop_data: Shop registration data
        db: Database session
    
    Returns:
        API response with success message
    
    Raises:
        HTTPException: If registration fails due to duplicate data
    """
    # Check if shop already exists
    if get_shop_by_pan_id(db, shop_data.pan_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Shop with this PAN ID already exists"
        )
    
    try:
        create_shop(db, shop_data)
        return APIResponse(
            success=True,
            message="Shop registered successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}"
        )

@app.post("/login", response_model=Token)
async def login_shop(shop_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate shop and return JWT token.
    
    Args:
        shop_credentials: Shop login credentials
        db: Database session
    
    Returns:
        JWT token and shop information
    
    Raises:
        HTTPException: If authentication fails
    """
    shop = authenticate_shop(db, shop_credentials.pan_id, shop_credentials.password)
    if not shop:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect PAN ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": shop.pan_id}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        shop_info=ShopResponse.from_orm(shop)
    )

# Product endpoints
@app.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_new_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_shop: Shop = Depends(get_current_authenticated_shop)
):
    """
    Create a new product.
    
    Args:
        product_data: Product creation data
        db: Database session
        current_shop: Current authenticated shop
    
    Returns:
        Created product data
    """
    try:
        product = create_product(db, product_data)
        return ProductResponse.from_orm(product)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create product: {str(e)}"
        )

@app.get("/products", response_model=List[ProductResponse])
async def get_all_products(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_shop: Shop = Depends(get_current_authenticated_shop)
):
    """
    Get all products with pagination.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        current_shop: Current authenticated shop
    
    Returns:
        List of products
    """
    products = get_products(db, skip=skip, limit=limit)
    return [ProductResponse.from_orm(product) for product in products]

@app.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_shop: Shop = Depends(get_current_authenticated_shop)
):
    """
    Get a specific product by ID.
    
    Args:
        product_id: Product ID
        db: Database session
        current_shop: Current authenticated shop
    
    Returns:
        Product data
    
    Raises:
        HTTPException: If product not found
    """
    product = get_product_by_id(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return ProductResponse.from_orm(product)

@app.put("/products/{product_id}", response_model=ProductResponse)
async def update_existing_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_db),
    current_shop: Shop = Depends(get_current_authenticated_shop)
):
    """
    Update an existing product.
    
    Args:
        product_id: Product ID to update
        product_data: Updated product data
        db: Database session
        current_shop: Current authenticated shop
    
    Returns:
        Updated product data
    
    Raises:
        HTTPException: If product not found
    """
    product = update_product(db, product_id, product_data)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return ProductResponse.from_orm(product)

@app.delete("/products/{product_id}", response_model=APIResponse)
async def delete_existing_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_shop: Shop = Depends(get_current_authenticated_shop)
):
    """
    Delete a product.
    
    Args:
        product_id: Product ID to delete
        db: Database session
        current_shop: Current authenticated shop
    
    Returns:
        API response with success message
    
    Raises:
        HTTPException: If product not found
    """
    success = delete_product(db, product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    return APIResponse(
        success=True,
        message="Product deleted successfully"
    )

# Transaction endpoints
@app.post("/transaction", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_new_transaction(
    transaction_data: TransactionCreate,
    db: Session = Depends(get_db),
    current_shop: Shop = Depends(get_current_authenticated_shop)
):
    """
    Create a new transaction.
    
    Args:
        transaction_data: Transaction creation data
        db: Database session
        current_shop: Current authenticated shop
    
    Returns:
        Created transaction data
    """
    try:
        transaction = create_transaction(db, current_shop.pan_id, transaction_data)
        # Calculate total manually to avoid property issues
        calculated_total = transaction.price * transaction.quantity
        
        # Create response with calculated total
        transaction_dict = {
            "transaction_id": transaction.transaction_id,
            "pan_id": transaction.pan_id,
            "product_id": transaction.product_id,
            "product_name": transaction.product_name,
            "price": transaction.price,
            "quantity": transaction.quantity,
            "total": calculated_total,
            "txn_date": transaction.txn_date
        }
        return TransactionResponse(**transaction_dict)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create transaction: {str(e)}"
        )

@app.post("/transactions/batch", response_model=TransactionSyncResponse)
async def sync_batch_transactions(
    batch_data: TransactionBatch,
    db: Session = Depends(get_db),
    current_shop: Shop = Depends(get_current_authenticated_shop)
):
    """
    Sync multiple transactions from offline storage.
    
    Args:
        batch_data: Batch of transactions to sync
        db: Database session
        current_shop: Current authenticated shop
    
    Returns:
        Sync response with success/failure counts
    """
    try:
        success_count, errors = create_batch_transactions(
            db, current_shop.pan_id, batch_data.transactions
        )
        
        return TransactionSyncResponse(
            success=True,
            message=f"Synced {success_count} transactions successfully",
            synced_count=success_count,
            failed_count=len(errors),
            errors=errors if errors else None
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync transactions: {str(e)}"
        )

@app.get("/transactions", response_model=List[TransactionResponse])
async def get_shop_transactions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_shop: Shop = Depends(get_current_authenticated_shop)
):
    """
    Get transactions for the current shop.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        current_shop: Current authenticated shop
    
    Returns:
        List of transactions
    """
    transactions = get_transactions_by_shop(db, current_shop.pan_id, skip=skip, limit=limit)
    return [TransactionResponse.from_orm(transaction) for transaction in transactions]

# Simple Reward endpoints
@app.get("/rewards/current", response_model=ShopRewardResponse)
async def get_current_rewards(
    db: Session = Depends(get_db),
    current_shop: Shop = Depends(get_current_authenticated_shop)
):
    """Get current reward points for the authenticated shop."""
    reward = get_reward_by_pan_id(db, str(current_shop.pan_id))
    if not reward:
        # Create initial reward if not exists
        from crud import create_initial_reward
        reward = create_initial_reward(db, str(current_shop.pan_id))
    return ShopRewardResponse.from_orm(reward)

@app.get("/rewards/details")
async def get_reward_details(
    db: Session = Depends(get_db),
    current_shop: Shop = Depends(get_current_authenticated_shop)
):
    """Get detailed reward breakdown and metrics for the authenticated shop."""
    from enhanced_reward_system import calculate_shop_rewards
    
    try:
        details = calculate_shop_rewards(db, str(current_shop.pan_id))
        return details
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate reward details: {str(e)}"
        )

@app.get("/rewards/leaderboard")
async def get_rewards_leaderboard(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_shop: Shop = Depends(get_current_authenticated_shop)
):
    """Get reward leaderboard showing top shops."""
    from enhanced_reward_system import EnhancedRewardCalculator
    
    calculator = EnhancedRewardCalculator(db)
    leaderboard = calculator.get_leaderboard(limit)
    
    # Find current shop's rank
    current_rank = None
    for item in leaderboard:
        if item["pan_id"] == current_shop.pan_id:
            current_rank = item["rank"]
            break
    
    return {
        "leaderboard": leaderboard,
        "current_shop_rank": current_rank,
        "total_shops": len(leaderboard)
    }

@app.get("/rewards", response_model=ShopRewardResponse)
async def get_shop_rewards_legacy(
    db: Session = Depends(get_db),
    current_shop: Shop = Depends(get_current_authenticated_shop)
):
    """Legacy rewards endpoint for backward compatibility."""
    return await get_current_rewards(db, current_shop)

@app.post("/rewards/calculate", response_model=APIResponse)
async def calculate_rewards_for_shop(
    days: int = 30,
    db: Session = Depends(get_db),
    current_shop: Shop = Depends(get_current_authenticated_shop)
):
    """Calculate and award new reward points for the authenticated shop."""
    from enhanced_reward_system import EnhancedRewardCalculator
    
    try:
        calculator = EnhancedRewardCalculator(db)
        
        # Calculate new rewards
        breakdown = calculator.calculate_rewards(str(current_shop.pan_id), days)
        
        # Award the points
        if breakdown.total_points > 0:
            calculator.update_shop_rewards(str(current_shop.pan_id), breakdown.total_points)
        
        return APIResponse(
            success=True,
            message=f"Calculated and awarded {breakdown.total_points} reward points"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate rewards: {str(e)}"
        )

@app.post("/rewards/process", response_model=APIResponse)
async def process_rewards_manually(
    db: Session = Depends(get_db),
    current_shop: Shop = Depends(get_current_authenticated_shop)
):
    """Manually trigger reward processing."""
    try:
        # Simple reward calculation: 1 point per transaction in last 30 days
        from datetime import datetime, timedelta
        cutoff_date = datetime.now() - timedelta(days=30)
        
        recent_transactions = get_transactions_by_shop(db, str(current_shop.pan_id))
        transaction_count = len([t for t in recent_transactions if t.txn_date.date() >= cutoff_date.date()])
        
        # Add points to reward
        reward = get_reward_by_pan_id(db, str(current_shop.pan_id))
        if reward:
            # Use SQLAlchemy text for raw SQL
            from sqlalchemy import text
            db.execute(
                text("UPDATE rewards SET reward_points = reward_points + :points WHERE pan_id = :pan_id"),
                {"points": transaction_count, "pan_id": str(current_shop.pan_id)}
            )
            db.commit()
        
        return APIResponse(
            success=True,
            message=f"Added {transaction_count} reward points based on recent transactions"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process rewards: {str(e)}"
        )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "Pasale Backend API is running"}

# Scheduler management endpoints
@app.get("/admin/scheduler/status")
async def get_scheduler_status():
    """Get scheduler status (admin only)"""
    from scheduler import get_scheduler_status
    return get_scheduler_status()

@app.post("/admin/scheduler/force-etl")
async def force_etl_update():
    """Force an immediate ETL update (admin only)"""
    from scheduler import force_etl_run
    result = force_etl_run()
    if result["success"]:
        return APIResponse(success=True, message="ETL update completed successfully", data=result)
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ETL update failed: {result.get('error', 'Unknown error')}"
        )

@app.post("/admin/scheduler/force-rewards")
async def force_reward_update():
    """Force an immediate reward system update (admin only)"""
    from scheduler import force_reward_run
    result = force_reward_run()
    if result["success"]:
        return APIResponse(
            success=True, 
            message=f"Reward update completed: {result['updated_shops']}/{result['total_shops']} shops updated, {result['total_points_awarded']} points awarded",
            data=result
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Reward update failed: {result.get('error', 'Unknown error')}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
