from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ENVIRONMENT: str = "development"
    # Auth
    access_token_expire_minutes: int = 60  # minutes
    debug: bool = False
    
    # Reward System Configuration
    POINTS_PER_SALE: int = 2
    POINTS_PER_PURCHASE: int = 1
    POINTS_PER_RETURN: int = 0
    DAILY_BONUS_THRESHOLD: int = 10  # transactions
    DAILY_BONUS_POINTS: int = 10
    STREAK_DAYS: int = 7
    STREAK_MIN_TRANSACTIONS: int = 5
    STREAK_BONUS_POINTS: int = 50
    MAX_DAILY_POINTS: int = 100  # Anti-fraud cap
    POINTS_TO_NPR_RATIO: float = 0.1  # 1 point = Rs. 0.10
    MIN_REDEMPTION_POINTS: int = 1000  # 1000 points = Rs. 100

     # Fraud Detection Thresholds
    FRAUD_MAX_TRANSACTIONS_PER_MINUTE: int = 5
    FRAUD_MAX_TRANSACTIONS_PER_HOUR: int = 100
    FRAUD_MAX_QUANTITY_PER_TRANSACTION: int = 500
    FRAUD_SUSPICIOUS_HOURS_START: int = 23  # 11 PM
    FRAUD_SUSPICIOUS_HOURS_END: int = 6  # 6 AM
    FRAUD_DUPLICATE_WINDOW_MINUTES: int = 5
    FRAUD_PRICE_DEVIATION_THRESHOLD: float = 3.0  # 3x standard deviation
    FRAUD_INVENTORY_MISMATCH_THRESHOLD: int = 50  # Negative inventory threshold
    FRAUD_AUTO_SUSPEND_THRESHOLD: float = 0.8  # Suspend if score > 0.8
    FRAUD_HIGH_RISK_THRESHOLD: float = 0.6
    FRAUD_MEDIUM_RISK_THRESHOLD: float = 0.3
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()