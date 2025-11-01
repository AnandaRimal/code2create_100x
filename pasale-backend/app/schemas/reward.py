from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.models.reward import RewardReason

# For response
class RewardResponse(BaseModel):
    reward_id: str
    shop_id: str
    points_change: int
    balance_after: int
    reason: RewardReason
    source_txn_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# For reward history list
class RewardListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    current_balance: int
    total_earned: int
    total_redeemed: int
    rewards: list[RewardResponse]

# For balance response
class RewardBalanceResponse(BaseModel):
    shop_id: str
    current_balance: int
    total_earned: int
    total_redeemed: int
    balance_in_npr: float
    can_redeem: bool
    next_milestone: Optional[dict] = None  # {points_needed: 500, milestone: "1000 points"}

# For redemption request
class RewardRedemptionRequest(BaseModel):
    points: int = Field(..., gt=0)
    redemption_method: str = Field(..., pattern="^(esewa|khalti|bank)$")
    account_details: str  # Phone number or bank account

# For daily stats
class DailyRewardStats(BaseModel):
    date: str
    transactions_logged: int
    points_earned: int
    bonuses_earned: int
    reached_daily_cap: bool