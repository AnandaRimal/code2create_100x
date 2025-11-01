from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas.fraud import (
    FraudAlertResponse,
    FraudAlertListResponse,
    FraudScoreResponse,
    UpdateAlertStatusRequest
)
from app.crud import fraud as crud_fraud
from app.utils.dependencies import get_current_shopkeeper
from app.models.shopkeeper import Shopkeeper
from app.models.fraud import FraudRiskLevel, FraudStatus
from app.config import settings

router = APIRouter(prefix="/fraud", tags=["Fraud Detection"])

@router.get("/my-score", response_model=FraudScoreResponse)
def get_my_fraud_score(
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Get fraud score for current shop"""
    
    shop_id = str(current_shopkeeper.shop_id)
    score = crud_fraud.get_or_create_shop_fraud_score(db, shop_id)
    
    # Determine risk level based on score
    if score.overall_score >= settings.FRAUD_HIGH_RISK_THRESHOLD:
        risk_level = "high"
    elif score.overall_score >= settings.FRAUD_MEDIUM_RISK_THRESHOLD:
        risk_level = "medium"
    else:
        risk_level = "low"
    
    return {
        "shop_id": str(score.shop_id),
        "overall_score": round(score.overall_score, 3),
        "velocity_score": round(score.velocity_score, 3),
        "pattern_score": round(score.pattern_score, 3),
        "quantity_score": round(score.quantity_score, 3),
        "behavioral_score": round(score.behavioral_score, 3),
        "total_alerts": score.total_alerts,
        "confirmed_frauds": score.confirmed_frauds,
        "false_positives": score.false_positives,
        "is_suspended": score.is_suspended,
        "risk_level": risk_level,
        "last_calculated": score.last_calculated
    }

@router.get("/my-alerts", response_model=FraudAlertListResponse)
def get_my_fraud_alerts(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    risk_level: Optional[FraudRiskLevel] = Query(None),
    status: Optional[FraudStatus] = Query(None),
    current_shopkeeper: Shopkeeper = Depends(get_current_shopkeeper),
    db: Session = Depends(get_db)
):
    """Get fraud alerts for current shop"""
    
    shop_id = str(current_shopkeeper.shop_id)
    skip = (page - 1) * page_size
    
    alerts, total = crud_fraud.get_fraud_alerts(
        db,
        shop_id=shop_id,
        risk_level=risk_level,
        status=status,
        skip=skip,
        limit=page_size
    )
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "alerts": alerts
    }

# ====================
# ADMIN ENDPOINTS (Add authentication middleware later)
# ====================

@router.get("/admin/alerts", response_model=FraudAlertListResponse)
def get_all_fraud_alerts(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    risk_level: Optional[FraudRiskLevel] = Query(None),
    status: Optional[FraudStatus] = Query(None),
    db: Session = Depends(get_db)
    # TODO: Add admin authentication
):
    """Get all fraud alerts (admin only)"""
    
    skip = (page - 1) * page_size
    
    alerts, total = crud_fraud.get_fraud_alerts(
        db,
        shop_id=None,  # All shops
        risk_level=risk_level,
        status=status,
        skip=skip,
        limit=page_size
    )
    
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "alerts": alerts
    }

@router.put("/admin/alerts/{alert_id}", response_model=FraudAlertResponse)
def update_fraud_alert(
    alert_id: str,
    update_data: UpdateAlertStatusRequest,
    db: Session = Depends(get_db)
    # TODO: Add admin authentication
):
    """Update fraud alert status (admin only)"""
    
    # TODO: Get admin user from authentication
    admin_user = "admin@pasale.com"
    
    alert = crud_fraud.update_alert_status(
        db,
        alert_id,
        update_data.status,
        admin_user,
        update_data.notes
    )
    
    return alert

@router.get("/admin/high-risk-shops")
def get_high_risk_shops(
    threshold: float = Query(0.6, ge=0.0, le=1.0),
    db: Session = Depends(get_db)
    # TODO: Add admin authentication
):
    """Get shops with high fraud scores (admin only)"""
    
    from app.models.fraud import ShopFraudScore
    from app.models.shopkeeper import Shopkeeper
    
    high_risk_shops = db.query(ShopFraudScore, Shopkeeper).join(
        Shopkeeper, ShopFraudScore.shop_id == Shopkeeper.shop_id
    ).filter(
        ShopFraudScore.overall_score >= threshold
    ).order_by(ShopFraudScore.overall_score.desc()).all()
    
    results = []
    for score, shopkeeper in high_risk_shops:
        results.append({
            "shop_id": str(score.shop_id),
            "shop_name": shopkeeper.shop_name,
            "contact": shopkeeper.contact,
            "overall_score": round(score.overall_score, 3),
            "total_alerts": score.total_alerts,
            "confirmed_frauds": score.confirmed_frauds,
            "is_suspended": score.is_suspended
        })
    
    return {
        "total": len(results),
        "threshold": threshold,
        "shops": results
    }

@router.post("/admin/recalculate-scores")
def recalculate_all_fraud_scores(
    db: Session = Depends(get_db)
    # TODO: Add admin authentication
):
    """Recalculate fraud scores for all shops (admin only)"""
    
    from app.models.shopkeeper import Shopkeeper
    
    shopkeepers = db.query(Shopkeeper).all()
    updated_count = 0
    
    for shopkeeper in shopkeepers:
        try:
            crud_fraud.update_shop_fraud_score(db, str(shopkeeper.shop_id))
            updated_count += 1
        except Exception as e:
            print(f"Failed to update score for {shopkeeper.shop_id}: {e}")
    
    return {
        "message": "Fraud scores recalculated",
        "updated_count": updated_count,
        "total_shops": len(shopkeepers)
    }