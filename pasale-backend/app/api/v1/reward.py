from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.database import get_db
from app.schemas.reward import (
    RewardResponse,
    RewardListResponse,
    RewardBalanceResponse,
    RewardRedemptionRequest,
    DailyRewardStats
)
from app.crud import reward as crud_reward
from app.utils.dependencies import get_current_shopkeeper
from app.models.shopkeeper import Shopkeeper
from app.config import settings

router = APIRouter(prefix="/rewards", tags=["Rewards"])

@router.get("/balance", response_model=RewardBalanceResponse)
def get_reward_balance(
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Get current reward balance"""
    
    shop_id = str(current_shopkeeper.shop_id)
    current_balance = crud_reward.get_current_balance(db, shop_id)
    total_earned, total_redeemed = crud_reward.get_total_earned_and_redeemed(db, shop_id)
    
    balance_in_npr = current_balance * settings.POINTS_TO_NPR_RATIO
    can_redeem = current_balance >= settings.MIN_REDEMPTION_POINTS
    
    # Calculate next milestone
    next_milestone = None
    milestones = [1000, 2000, 5000, 10000]
    for milestone in milestones:
        if current_balance < milestone:
            next_milestone = {
                "points_needed": milestone - current_balance,
                "milestone": milestone,
                "reward_npr": milestone * settings.POINTS_TO_NPR_RATIO
            }
            break
    
    return {
        "shop_id": shop_id,
        "current_balance": current_balance,
        "total_earned": total_earned,
        "total_redeemed": total_redeemed,
        "balance_in_npr": round(balance_in_npr, 2),
        "can_redeem": can_redeem,
        "next_milestone": next_milestone
    }

@router.get("/history", response_model=RewardListResponse)
def get_reward_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Get reward history"""
    
    shop_id = str(current_shopkeeper.shop_id)
    skip = (page - 1) * page_size
    
    rewards, total = crud_reward.get_reward_history(db, shop_id, skip, page_size)
    current_balance = crud_reward.get_current_balance(db, shop_id)
    total_earned, total_redeemed = crud_reward.get_total_earned_and_redeemed(db, shop_id)
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "current_balance": current_balance,
        "total_earned": total_earned,
        "total_redeemed": total_redeemed,
        "rewards": rewards
    }

@router.post("/redeem", response_model=RewardResponse)
def redeem_rewards(
    redemption: RewardRedemptionRequest,
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Redeem reward points"""
    
    shop_id = str(current_shopkeeper.shop_id)
    
    reward = crud_reward.redeem_points(
        db,
        shop_id,
        redemption.points,
        redemption.redemption_method,
        redemption.account_details
    )
    
    return reward

@router.get("/daily-stats", response_model=DailyRewardStats)
def get_daily_reward_stats(
    date: datetime = Query(default_factory=datetime.utcnow),
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Get reward statistics for a specific day"""
    
    shop_id = str(current_shopkeeper.shop_id)
    stats = crud_reward.get_daily_stats(db, shop_id, date)
    
    return stats

@router.get("/config")
def get_reward_config():
    """Get reward system configuration"""
    
    return {
        "points_per_sale": settings.POINTS_PER_SALE,
        "points_per_purchase": settings.POINTS_PER_PURCHASE,
        "points_per_return": settings.POINTS_PER_RETURN,
        "daily_bonus_threshold": settings.DAILY_BONUS_THRESHOLD,
        "daily_bonus_points": settings.DAILY_BONUS_POINTS,
        "streak_days": settings.STREAK_DAYS,
        "streak_min_transactions": settings.STREAK_MIN_TRANSACTIONS,
        "streak_bonus_points": settings.STREAK_BONUS_POINTS,
        "max_daily_points": settings.MAX_DAILY_POINTS,
        "points_to_npr_ratio": settings.POINTS_TO_NPR_RATIO,
        "min_redemption_points": settings.MIN_REDEMPTION_POINTS
    }