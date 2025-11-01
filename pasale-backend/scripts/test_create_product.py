import sys, json, urllib.request
sys.path.insert(0, r'C:\Users\ASUS\OneDrive\Desktop\code2create_100x\pasale-backend')
from app.database import SessionLocal
from app.models.shopkeeper import Shopkeeper
from app.utils.security import create_access_token

s = SessionLocal()
sk = s.query(Shopkeeper).first()
if not sk:
    print('NO_SHOPKEEPER')
    raise SystemExit(1)

token = create_access_token({'sub': str(sk.shop_id)})
print('Using shop_id:', sk.shop_id)
print('Token len:', len(token))

payload = {"product_name":"Automated Test Product","category":"Snacks","price":20.0,"unit":"piece"}
req = urllib.request.Request(
    'http://127.0.0.1:8000/api/v1/products/',
    data=json.dumps(payload).encode('utf-8'),
    headers={
        'Content-Type':'application/json',
        'Authorization': f'Bearer {token}'
    },
    method='POST'
)
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        body = resp.read().decode('utf-8')
        print('STATUS', resp.status)
        print('BODY', body)
except Exception as e:
    import traceback
    traceback.print_exc()
    if hasattr(e, 'read'):
        try:
            print('ERR BODY:', e.read().decode())
        except Exception:
            pass
    raise
