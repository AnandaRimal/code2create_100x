import requests
import json

# Test the current user's products
base_url = 'http://localhost:8000/api/v1'

# Login first
login_data = {
    'identifier': '9711111111',  # Current user contact
    'password': 'password123'
}

try:
    # Login
    response = requests.post(f'{base_url}/shopkeepers/login', json=login_data)
    if response.status_code != 200:
        print(f'Login failed: {response.status_code} - {response.text}')
        exit()
    
    token_data = response.json()
    token = token_data['access_token']
    print(f'Login successful: {token_data["shopkeeper"]["shop_name"]}')
    
    # Test products API
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(f'{base_url}/products/?page=1&page_size=10', headers=headers)
    print(f'Products API: {response.status_code}')
    
    if response.status_code == 200:
        data = response.json()
        print(f'Found {data["total"]} products')
        if data['products']:
            print('Sample products:')
            for p in data['products'][:3]:
                print(f'  - {p["product_name"]}: Rs.{p["price"]}')
    else:
        print(f'Products error: {response.text}')
        
except Exception as e:
    print(f'Error: {e}')