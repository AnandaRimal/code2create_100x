from fastapi import APIRouter
from app.api.v1 import shopkeeper, product, transaction, reward

api_router = APIRouter()
api_router.include_router(shopkeeper.router, prefix="/v1")
api_router.include_router(product.router, prefix="/v1")
api_router.include_router(transaction.router, prefix="/v1")
api_router.include_router(reward.router, prefix="/v1")