import uuid
from datetime import datetime
import random

# Use the application's DB/session and models so we stay in sync with migrations
from app.database import SessionLocal
from app.models.shopkeeper import Shopkeeper
from app.models.product import Product
from app.utils.security import hash_password

def get_realistic_stock(category, unit):
    """Generate realistic stock quantities based on product type"""
    if unit in ['केजी', 'kg']:
        return round(random.uniform(5, 100), 2)  # 5-100 kg for staples
    elif unit in ['लिटर', 'liter']:
        return round(random.uniform(2, 20), 2)   # 2-20 liters for liquids
    elif unit in ['प्याकेट', 'packet']:
        return random.randint(10, 100)           # 10-100 packets
    elif unit in ['बोतल', 'bottle']:
        return random.randint(5, 50)             # 5-50 bottles
    elif unit in ['पिस', 'piece']:
        return random.randint(20, 200)           # 20-200 pieces
    else:
        return random.randint(10, 100)

def main():
    # Create a demo shop if needed
    session = SessionLocal()
    
    # Check if demo shop exists, if not create one
    demo_shop = session.query(Shopkeeper).filter(Shopkeeper.shop_name == "Demo Pasale Shop").first()
    if not demo_shop:
        demo_shop = Shopkeeper(
            shop_id=str(uuid.uuid4()),
            shop_name="Demo Pasale Shop",
            contact="9800000000",
            email="demo@pasale.local",
            password=hash_password("password123")
        )
        session.add(demo_shop)
        session.commit()
    
    shop_id = demo_shop.shop_id
    
    # Your product data with realistic stock
    products_data = [
        # खानेकुरा (Food Items)
        {"name": "बास्मती चामल", "category": "खानेकुरा", "price": 180, "unit": "केजी"},
        {"name": "दाल", "category": "खानेकुरा", "price": 150, "unit": "केजी"},
        {"name": "तोरीको तेल", "category": "खानेकुरा", "price": 320, "unit": "लिटर"},
        {"name": "नुन", "category": "खानेकुरा", "price": 50, "unit": "प्याकेट"},
        {"name": "चिनी", "category": "खानेकुरा", "price": 90, "unit": "केजी"},
        # पेय पदार्थ (Beverages)
        {"name": "कोका कोला", "category": "पेय पदार्थ", "price": 80, "unit": "बोतल"},
        {"name": "फ्यान्टा", "category": "पेय पदार्थ", "price": 75, "unit": "बोतल"},
        {"name": "मिनरल वाटर", "category": "पेय पदार्थ", "price": 30, "unit": "बोतल"},
        {"name": "चिया पत्ती", "category": "पेय पदार्थ", "price": 200, "unit": "प्याकेट"},
        {"name": "कफी पाउडर", "category": "पेय पदार्थ", "price": 250, "unit": "प्याकेट"},
        # सरसामान (Household Items)
        {"name": "साबुन", "category": "सरसामान", "price": 40, "unit": "पिस"},
        {"name": "सर्फ एक्सेल", "category": "सरसामान", "price": 150, "unit": "प्याकेट"},
        {"name": "टुथपेस्ट", "category": "सरसामान", "price": 60, "unit": "पिस"},
        {"name": "शैम्पू", "category": "सरसामान", "price": 120, "unit": "बोतल"},
        {"name": "टॉयलेट पेपर", "category": "सरसामान", "price": 30, "unit": "प्याकेट"},

        # अन्य (Miscellaneous)
        {"name": "ब्याट्री", "category": "अन्य", "price": 25, "unit": "पिस"},
        {"name": "लाइट बल्ब", "category": "अन्य", "price": 80, "unit": "पिस"},
        {"name": "म्याच बक्स", "category": "अन्य", "price": 15, "unit": "प्याकेट"},
        {"name": "प्लास्टिक झोला", "category": "अन्य", "price": 5, "unit": "प्याकेट"},
        {"name": "टिफिन बक्स", "category": "अन्य", "price": 200, "unit": "पिस"}, 


    ]
    
    # Insert products
    for product_info in products_data:
        # Check if product already exists for this shop
        existing = session.query(Product).filter(
            Product.shop_id == shop_id,
            Product.product_name == product_info["name"]
        ).first()
        
        if not existing:
            product = Product(
                product_id=str(uuid.uuid4()),
                shop_id=shop_id,
                product_name=product_info["name"],
                category=product_info["category"],
                price=product_info["price"],
                unit=product_info["unit"],
                is_active=True
            )
            session.add(product)
    
    session.commit()
    session.close()
    print("Products inserted successfully!")

if __name__ == "__main__":
    main()