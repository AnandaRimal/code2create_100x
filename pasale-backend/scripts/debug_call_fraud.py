from app.database import SessionLocal
from app.models.shopkeeper import Shopkeeper
from app.utils.security import create_access_token
import requests

# Get first shopkeeper
db = SessionLocal()
sk = db.query(Shopkeeper).first()
if not sk:
    print('No shopkeeper found in DB')
    exit(1)

print('Using shopkeeper id:', sk.shop_id)

token = create_access_token({'sub': str(sk.shop_id)})
print('Token created')

headers = {'Authorization': f'Bearer {token}'}
resp = requests.get('http://127.0.0.1:8000/api/v1/fraud/my-score', headers=headers)
print('Status:', resp.status_code)
print('Body:', resp.text)
