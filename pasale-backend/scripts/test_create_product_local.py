from fastapi.testclient import TestClient
import sys
sys.path.insert(0, r'C:\Users\ASUS\OneDrive\Desktop\code2create_100x\pasale-backend')
from app.main import app
from app.database import SessionLocal
from app.models.shopkeeper import Shopkeeper
from app.utils.security import create_access_token

client = TestClient(app)

s = SessionLocal()
sk = s.query(Shopkeeper).first()
if not sk:
    print('NO_SHOPKEEPER')
    raise SystemExit(1)

token = create_access_token({'sub': str(sk.shop_id)})
print('Using shop_id:', sk.shop_id)
print('Token len:', len(token))

payload = {"product_name":"Local Test Product","category":"Snacks","price":20.0,"unit":"piece"}
headers = {"Authorization": f"Bearer {token}"}

resp = client.post('/api/v1/products/', json=payload, headers=headers)
print('STATUS', resp.status_code)
print('BODY', resp.text)

if resp.status_code >= 500:
    # try to raise to see server exception (TestClient raises server exceptions by default)
    resp.raise_for_status()
