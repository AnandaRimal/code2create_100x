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
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()