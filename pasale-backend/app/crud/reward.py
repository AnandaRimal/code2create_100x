from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
from app.models.reward import Reward, RewardReason
from app.models.transaction import Transaction, TransactionType
from app.models.shopkeeper import Shopkeeper
from app.config import settings
from typing import Optional, List, Tuple
from datetime import datetime, timedelta
from fastapi import HTTPException, status

def get_current_balance(db: Session, shop_id: str) -> int:
    """Get current reward points balance for a shop"""
    latest_reward = db.query(Reward).filter(
        Reward.shop_id == shop_id
    ).order_by(desc(Reward.created_at)).first()
    
    return latest_reward.balance_after if latest_reward else 0

def get_total_earned_and_redeemed(db: Session, shop_id: str) -> Tuple[int, int]:
    """Get total points earned and redeemed"""
    rewards = db.query(Reward).filter(Reward.shop_id == shop_id).all()
    
    total_earned = sum(r.points_change for r in rewards if r.points_change > 0)
    total_redeemed = sum(abs(r.points_change) for r in rewards if r.points_change < 0)
    
    return total_earned, total_redeemed

def add_reward(
    db: Session,
    shop_id: str,
    points: int,
    reason: RewardReason,
    source_txn_id: Optional[str] = None,
    notes: Optional[str] = None
) -> Reward:
    """Add reward entry (positive or negative points)"""
    
    current_balance = get_current_balance(db, shop_id)
    new_balance = current_balance + points
    
    # Prevent negative balance (can't redeem more than you have)
    if new_balance < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient reward points"
        )
    
    reward = Reward(
        shop_id=shop_id,
        points_change=points,
        balance_after=new_balance,
        reason=reason,
        source_txn_id=source_txn_id,
        notes=notes
    )
    
    db.add(reward)
    db.commit()
    db.refresh(reward)
    
    return reward

def calculate_transaction_points(transaction_type: TransactionType) -> int:
    """Calculate points based on transaction type"""
    if transaction_type == TransactionType.SALE:
        return settings.POINTS_PER_SALE
    elif transaction_type == TransactionType.PURCHASE:
        return settings.POINTS_PER_PURCHASE
    elif transaction_type == TransactionType.RETURN:
        return settings.POINTS_PER_RETURN
    return 0

def award_transaction_points(
    db: Session,
    shop_id: str,
    transaction_id: str,
    transaction_type: TransactionType
) -> Optional[Reward]:
    """Award points for a transaction"""
    
    # Check daily cap
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_points = db.query(func.sum(Reward.points_change)).filter(
        and_(
            Reward.shop_id == shop_id,
            Reward.created_at >= today_start,
            Reward.points_change > 0
        )
    ).scalar() or 0
    
    if today_points >= settings.MAX_DAILY_POINTS:
        return None  # Hit daily cap, no more points today
    
    # Calculate points
    points = calculate_transaction_points(transaction_type)
    
    if points == 0:
        return None
    
    # Award points
    reward = add_reward(
        db,
        shop_id,
        points,
        RewardReason.TRANSACTION_SALE if transaction_type == TransactionType.SALE else RewardReason.TRANSACTION_PURCHASE,
        source_txn_id=transaction_id,
        notes=f"Points for {transaction_type.value} transaction"
    )
    
    # Check for daily bonus
    check_and_award_daily_bonus(db, shop_id)
    
    # Check for streak bonus
    check_and_award_streak_bonus(db, shop_id)
    
    return reward

def check_and_award_daily_bonus(db: Session, shop_id: str) -> Optional[Reward]:
    """Check if shop qualifies for daily bonus"""
    
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Check if already awarded today
    bonus_today = db.query(Reward).filter(
        and_(
            Reward.shop_id == shop_id,
            Reward.reason == RewardReason.DAILY_BONUS,
            Reward.created_at >= today_start
        )
    ).first()
    
    if bonus_today:
        return None  # Already awarded
    
    # Count today's transactions
    transactions_today = db.query(func.count(Transaction.transaction_id)).filter(
        and_(
            Transaction.shop_id == shop_id,
            Transaction.date_time >= today_start
        )
    ).scalar()
    
    if transactions_today >= settings.DAILY_BONUS_THRESHOLD:
        return add_reward(
            db,
            shop_id,
            settings.DAILY_BONUS_POINTS,
            RewardReason.DAILY_BONUS,
            notes=f"Daily bonus for logging {transactions_today} transactions"
        )
    
    return None

def check_and_award_streak_bonus(db: Session, shop_id: str) -> Optional[Reward]:
    """Check if shop qualifies for streak bonus"""
    
    # Check if already awarded in last 7 days
    recent_streak = db.query(Reward).filter(
        and_(
            Reward.shop_id == shop_id,
            Reward.reason == RewardReason.STREAK_BONUS,
            Reward.created_at >= datetime.utcnow() - timedelta(days=7)
        )
    ).first()
    
    if recent_streak:
        return None  # Already awarded recently
    
    # Check last 7 days for qualifying transactions
    streak_valid = True
    for i in range(settings.STREAK_DAYS):
        day_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        transactions_that_day = db.query(func.count(Transaction.transaction_id)).filter(
            and_(
                Transaction.shop_id == shop_id,
                Transaction.date_time >= day_start,
                Transaction.date_time < day_end
            )
        ).scalar()
        
        if transactions_that_day < settings.STREAK_MIN_TRANSACTIONS:
            streak_valid = False
            break
    
    if streak_valid:
        return add_reward(
            db,
            shop_id,
            settings.STREAK_BONUS_POINTS,
            RewardReason.STREAK_BONUS,
            notes=f"{settings.STREAK_DAYS}-day streak bonus"
        )
    
    return None

def reverse_transaction_rewards(db: Session, transaction_id: str) -> bool:
    """Reverse rewards given for a transaction (when transaction is deleted)"""
    
    rewards = db.query(Reward).filter(
        Reward.source_txn_id == transaction_id
    ).all()
    
    for reward in rewards:
        if reward.points_change > 0:  # Only reverse positive points
            add_reward(
                db,
                str(reward.shop_id),
                -reward.points_change,
                RewardReason.FRAUD_REVERSAL,
                notes=f"Reversal for deleted transaction {transaction_id}"
            )
    
    return True

def get_reward_history(
    db: Session,
    shop_id: str,
    skip: int = 0,
    limit: int = 100
) -> Tuple[List[Reward], int]:
    """Get reward history with pagination"""
    
    query = db.query(Reward).filter(Reward.shop_id == shop_id)
    
    total = query.count()
    rewards = query.order_by(desc(Reward.created_at)).offset(skip).limit(limit).all()
    
    return rewards, total

def redeem_points(
    db: Session,
    shop_id: str,
    points: int,
    method: str,
    account_details: str
) -> Reward:
    """Redeem reward points"""
    
    current_balance = get_current_balance(db, shop_id)
    
    if current_balance < points:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient points. You have {current_balance} points."
        )
    
    if points < settings.MIN_REDEMPTION_POINTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum redemption is {settings.MIN_REDEMPTION_POINTS} points"
        )
    
    amount_npr = points * settings.POINTS_TO_NPR_RATIO
    
    reward = add_reward(
        db,
        shop_id,
        -points,  # Negative for redemption
        RewardReason.REDEMPTION,
        notes=f"Redeemed {points} points (Rs. {amount_npr:.2f}) via {method} to {account_details}"
    )
    
    # TODO: Integrate with payment gateway (eSewa, Khalti, etc.)
    # For now, just log the redemption
    
    return reward

def get_daily_stats(db: Session, shop_id: str, date: datetime) -> dict:
    """Get daily reward statistics"""
    
    day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end = day_start + timedelta(days=1)
    
    # Transactions logged
    transactions = db.query(func.count(Transaction.transaction_id)).filter(
        and_(
            Transaction.shop_id == shop_id,
            Transaction.date_time >= day_start,
            Transaction.date_time < day_end
        )
    ).scalar()
    
    # Points earned
    rewards = db.query(Reward).filter(
        and_(
            Reward.shop_id == shop_id,
            Reward.created_at >= day_start,
            Reward.created_at < day_end,
            Reward.points_change > 0
        )
    ).all()
    
    points_from_transactions = sum(
        r.points_change for r in rewards 
        if r.reason in [RewardReason.TRANSACTION_SALE, RewardReason.TRANSACTION_PURCHASE]
    )
    
    bonuses = sum(
        r.points_change for r in rewards
        if r.reason in [RewardReason.DAILY_BONUS, RewardReason.STREAK_BONUS]
    )
    
    total_points = points_from_transactions + bonuses
    
    return {
        "date": day_start.strftime("%Y-%m-%d"),
        "transactions_logged": transactions,
        "points_earned": total_points,
        "bonuses_earned": bonuses,
        "reached_daily_cap": total_points >= settings.MAX_DAILY_POINTS
    }