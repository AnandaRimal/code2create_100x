"""Test script to verify product quantity functionality"""
from app.database import SessionLocal
from app.models.shopkeeper import Shopkeeper
from app.models.product import Product
from app.schemas.product import ProductCreate
from app.crud import product as crud_product
from app.utils.security import create_access_token
import requests

# Get or create a shopkeeper for testing
db = SessionLocal()
shopkeeper = db.query(Shopkeeper).first()

if not shopkeeper:
    print("No shopkeeper found in database. Please run insert_data.py first.")
    exit(1)

print(f"Using shopkeeper: {shopkeeper.shop_name} (ID: {shopkeeper.shop_id})")

# Test 1: Create a product with quantity
print("\n=== Test 1: Creating product with quantity ===")
test_product = ProductCreate(
    product_name="Test Product with Quantity",
    category="Test",
    price=99.99,
    unit="piece",
    quantity=50,
    opening_stock=50,
    reorder_level=10
)

created_product = crud_product.create_product(db, test_product, str(shopkeeper.shop_id))
print(f"✓ Product created: {created_product.product_name}")
print(f"  Product ID: {created_product.product_id}")
print(f"  Quantity: {created_product.quantity}")
print(f"  Price: Rs. {created_product.price}")

# Test 2: Fetch the product
print("\n=== Test 2: Fetching product ===")
fetched_product = crud_product.get_product_by_id(db, str(created_product.product_id), str(shopkeeper.shop_id))
print(f"✓ Product fetched: {fetched_product.product_name}")
print(f"  Quantity: {fetched_product.quantity}")

# Test 3: Update quantity
print("\n=== Test 3: Updating product quantity ===")
from app.schemas.product import ProductUpdate
update_data = ProductUpdate(quantity=75)
updated_product = crud_product.update_product(
    db, 
    str(created_product.product_id), 
    str(shopkeeper.shop_id), 
    update_data
)
print(f"✓ Product quantity updated")
print(f"  Old quantity: 50")
print(f"  New quantity: {updated_product.quantity}")

# Test 4: Verify inventory is in sync
print("\n=== Test 4: Checking inventory sync ===")
from app.crud import inventory as crud_inventory
inventory = crud_inventory.get_product_inventory(db, str(shopkeeper.shop_id), str(created_product.product_id))
print(f"✓ Inventory record found")
print(f"  Product quantity: {updated_product.quantity}")
print(f"  Inventory quantity: {inventory.current_quantity}")
print(f"  Quantities match: {updated_product.quantity == inventory.current_quantity}")

# Test 5: Test API endpoint with authentication
print("\n=== Test 5: Testing API endpoint ===")
token = create_access_token({"sub": str(shopkeeper.shop_id)})
headers = {"Authorization": f"Bearer {token}"}

# Create product via API
api_product_data = {
    "product_name": "API Test Product",
    "category": "Snacks",
    "price": 25.50,
    "unit": "packet",
    "quantity": 100,
    "opening_stock": 100,
    "reorder_level": 20
}

try:
    response = requests.post(
        "http://localhost:8000/api/v1/products",
        json=api_product_data,
        headers=headers
    )
    
    if response.status_code == 201:
        api_product = response.json()
        print(f"✓ Product created via API")
        print(f"  Name: {api_product['product_name']}")
        print(f"  Quantity: {api_product['quantity']}")
        print(f"  Product ID: {api_product['product_id']}")
    else:
        print(f"✗ API call failed: {response.status_code}")
        print(f"  Response: {response.text}")
except Exception as e:
    print(f"✗ Could not connect to API. Is the server running?")
    print(f"  Error: {e}")

print("\n=== All tests completed ===")
db.close()
