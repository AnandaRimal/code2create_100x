import requests
import json

# Test the API endpoints
base_url = "http://localhost:8000/api/v1"

def test_api():
    print("Testing FastAPI endpoints...")
    
    # Test 1: Check if server is running
    try:
        response = requests.get(f"{base_url}/")
        print(f"Server status: {response.status_code}")
    except Exception as e:
        print(f"Server not reachable: {e}")
        return
    
    # Test 2: Try to access products without auth (should fail)
    try:
        response = requests.get(f"{base_url}/products/?page=1&page_size=10")
        print(f"Products without auth: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error accessing products: {e}")
    
    # Test 3: Try to register a test user
    try:
        register_data = {
            "shop_name": "Test Shop",
            "shop_address": "Test Address",
            "contact": "9876543210",
            "password": "testpass123"
        }
        response = requests.post(f"{base_url}/shopkeepers/register", json=register_data)
        print(f"Register test user: {response.status_code}")
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error registering: {e}")
    
    # Test 4: Try to login with the correct credentials (detailed debugging)
    try:
        login_data = {
            "identifier": "9800000001",  # Contact for "shyam dai ko pasal"
            "password": "password123"  # Updated password
        }
        print(f"Sending login request with data: {login_data}")
        response = requests.post(f"{base_url}/shopkeepers/login", json=login_data)
        print(f"Login response status: {response.status_code}")
        print(f"Login response headers: {dict(response.headers)}")
        print(f"Login response body: {response.text}")
        
        if response.status_code == 200:
            token_data = response.json()
            print(f"Parsed response: {token_data}")
            token = token_data.get("access_token")
            shopkeeper = token_data.get("shopkeeper", {})
            print(f"Logged in as: {shopkeeper.get('shop_name')}")
            
            if token:
                # Test 5: Try to access products with auth
                headers = {"Authorization": f"Bearer {token}"}
                response = requests.get(f"{base_url}/products/?page=1&page_size=5", headers=headers)
                print(f"Products with auth: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"Found {data['total']} products")
                    print("Sample products:")
                    for product in data['products'][:3]:
                        print(f"  - {product['product_name']}: Rs.{product['price']}")
                else:
                    print(f"Error getting products: {response.text}")
        else:
            print(f"Login failed with status {response.status_code}")
            print(f"Error response: {response.text}")
                
    except Exception as e:
        print(f"Error during login: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_api()