from sqlalchemy import Column, String, Integer, TIMESTAMP, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid

from app.database import Base


class SyncStatus(str, enum.Enum):
    SUCCESS = "success"
    FAILED = "failed"


class SyncLog(Base):
    __tablename__ = "sync_logs"

    sync_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_id = Column(String(36), ForeignKey("shopkeepers.shop_id", ondelete="CASCADE"), nullable=False)
    device_id = Column(String(255), nullable=True)
    last_sync_time = Column(TIMESTAMP(timezone=True), server_default=func.now())
    records_uploaded = Column(Integer, default=0)
    records_downloaded = Column(Integer, default=0)
    status = Column(Enum(SyncStatus), nullable=False)

    # Relationships
    shopkeeper = relationship("Shopkeeper", back_populates="sync_logs")