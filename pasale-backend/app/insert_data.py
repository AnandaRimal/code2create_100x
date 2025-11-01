import uuid
from sqlalchemy import create_engine, Column, String, Float, Boolean, TIMESTAMP, Integer, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.sql import func
from sqlalchemy import text
import random

# Database configuration - UPDATE THESE CREDENTIALS
DATABASE_URL = "mysql+pymysql://root:root@localhost/pasale_db"
# For PostgreSQL: "postgresql://username:password@localhost/your_database"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Product(Base):
    __tablename__ = "products"
    product_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_id = Column(String(36), ForeignKey("shopkeepers.shop_id", ondelete="CASCADE"), nullable=False)
    product_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    price = Column(Float, nullable=False)
    unit = Column(String(50), nullable=True)
    current_stock = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    version = Column(Integer, default=1)

def get_realistic_stock(unit, category):
    """Generate realistic stock quantities based on unit and category"""
    if unit in ['केजी', 'kg']:
        if category == 'खानेकुरा':  # Food items
            return round(random.uniform(10, 50), 2)  # 10-50 kg for staples
        return round(random.uniform(5, 20), 2)  # 5-20 kg for other items
    
    elif unit in ['लिटर', 'liter']:
        return round(random.uniform(5, 30), 2)   # 5-30 liters for liquids
    
    elif unit in ['प्याकेट', 'packet']:
        if category == 'नास्ता / स्न्याक्स':  # Snacks
            return random.randint(20, 100)      # 20-100 packets for snacks
        return random.randint(10, 50)           # 10-50 packets for others
    
    elif unit in ['बोतल', 'bottle']:
        return random.randint(15, 60)           # 15-60 bottles
    
    elif unit in ['पिस', 'piece']:
        if category == 'घरेलु सामान':  # Household items
            return random.randint(30, 150)      # 30-150 pieces
        return random.randint(20, 80)           # 20-80 pieces
    
    elif unit in ['वटा', 'unit']:
        return random.randint(25, 100)          # 25-100 units
    
    else:  # For रोल, प्याकेट, etc.
        return random.randint(10, 50)

def main():
    session = SessionLocal()
    
    try:
        # Step 1: Delete all existing products
        print("Deleting all existing products...")
        session.query(Product).delete()
        session.commit()
        print("All products deleted successfully!")
        
        # Step 2: Get a valid shop_id (using the first shop in the database)
        shop = session.execute(text("SELECT shop_id FROM shopkeepers LIMIT 1")).first()
        if not shop:
            print("ERROR: No shop found in shopkeepers table! Please create a shop first.")
            return
        
        shop_id = shop[0]
        print(f"Using shop_id: {shop_id}")
        
        # Step 3: Define all products with realistic data
        products_data = [
            # खानेकुरा (Food Items)
            {"name": "बास्मती चामल", "category": "खानेकुरा", "price": 180, "unit": "केजी"},
            {"name": "दाल", "category": "खानेकुरा", "price": 150, "unit": "केजी"},
            {"name": "तोरीको तेल", "category": "खानेकुरा", "price": 320, "unit": "लिटर"},
            {"name": "नुन", "category": "खानेकुरा", "price": 20, "unit": "प्याकेट"},
            {"name": "चिनी", "category": "खानेकुरा", "price": 100, "unit": "केजी"},
            {"name": "पीठो", "category": "खानेकुरा", "price": 85, "unit": "केजी"},
            {"name": "गुन्द्रुक", "category": "खानेकुरा", "price": 95, "unit": "प्याकेट"},
            {"name": "गहुँ", "category": "खानेकुरा", "price": 90, "unit": "केजी"},
            {"name": "मकै", "category": "खानेकुरा", "price": 80, "unit": "केजी"},
            {"name": "कोदो", "category": "खानेकुरा", "price": 100, "unit": "केजी"},

            # मसला (Spices)
            {"name": "जीरा", "category": "मसला", "price": 200, "unit": "केजी"},
            {"name": "गरम मसला", "category": "मसला", "price": 120, "unit": "प्याकेट"},
            {"name": "हल्दी पाउडर", "category": "मसला", "price": 90, "unit": "प्याकेट"},
            {"name": "धनियाँ पाउडर", "category": "मसला", "price": 80, "unit": "प्याकेट"},
            {"name": "अदुवा पाउडर", "category": "मसला", "price": 100, "unit": "प्याकेट"},
            {"name": "लसुन पाउडर", "category": "मसला", "price": 110, "unit": "प्याकेट"},

            # नास्ता / स्न्याक्स (Snacks)
            {"name": "चाउचाउ", "category": "नास्ता / स्न्याक्स", "price": 25, "unit": "प्याकेट"},
            {"name": "कुरकुरे", "category": "नास्ता / स्न्याक्स", "price": 20, "unit": "प्याकेट"},
            {"name": "बिस्कुट", "category": "नास्ता / स्न्याक्स", "price": 30, "unit": "प्याकेट"},
            {"name": "पापड", "category": "नास्ता / स्न्याक्स", "price": 15, "unit": "पिस"},
            {"name": "सेल रोटी मिक्स", "category": "नास्ता / स्न्याक्स", "price": 125, "unit": "प्याकेट"},
            {"name": "भुजा", "category": "नास्ता / स्न्याक्स", "price": 40, "unit": "प्याकेट"},
            {"name": "मकै भुटेको", "category": "नास्ता / स्न्याक्स", "price": 30, "unit": "प्याकेट"},

            # पेय पदार्थ (Beverages)
            {"name": "कोकाकोला", "category": "पेय पदार्थ", "price": 60, "unit": "बोतल"},
            {"name": "फ्रूटी", "category": "पेय पदार्थ", "price": 25, "unit": "प्याकेट"},
            {"name": "रियल ज्यूस", "category": "पेय पदार्थ", "price": 90, "unit": "प्याकेट"},
            {"name": "मिनरल वाटर", "category": "पेय पदार्थ", "price": 20, "unit": "बोतल"},
            {"name": "नेपाली चिया", "category": "पेय पदार्थ", "price": 45, "unit": "प्याकेट"},
            {"name": "इन्स्टेन्ट कफी", "category": "पेय पदार्थ", "price": 120, "unit": "प्याकेट"},

            # घरेलु सामान (Household Items)
            {"name": "मह", "category": "घरेलु सामान", "price": 850, "unit": "बोतल"},
            {"name": "अचार", "category": "घरेलु सामान", "price": 280, "unit": "बोतल"},
            {"name": "घ्यु", "category": "घरेलु सामान", "price": 1200, "unit": "लिटर"},
            {"name": "सावुन", "category": "घरेलु सामान", "price": 25, "unit": "पिस"},
            {"name": "टुथपेस्ट", "category": "घरेलु सामान", "price": 90, "unit": "वटा"},
            {"name": "ब्रस", "category": "घरेलु सामान", "price": 40, "unit": "वटा"},
            {"name": "डिटर्जेन्ट पाउडर", "category": "घरेलु सामान", "price": 90, "unit": "प्याकेट"},
            {"name": "डिटर्जेन्ट बार", "category": "घरेलु सामान", "price": 25, "unit": "पिस"},
            {"name": "फिनाइल", "category": "घरेलु सामान", "price": 100, "unit": "बोतल"},
            {"name": "झाडु", "category": "घरेलु सामान", "price": 80, "unit": "वटा"},

            # खाना पकाउने सामग्री (Cooking Supplies)
            {"name": "ग्यास सिलिन्डर", "category": "खाना पकाउने सामग्री", "price": 1800, "unit": "वटा"},
            {"name": "कुकर", "category": "खाना पकाउने सामग्री", "price": 1200, "unit": "वटा"},
            {"name": "भाँडा माझ्ने साबुन", "category": "खाना पकाउने सामग्री", "price": 25, "unit": "पिस"},
            {"name": "भाँडा माझ्ने लिक्विड", "category": "खाना पकाउने सामग्री", "price": 120, "unit": "बोतल"},

            # बच्चाको सामग्री (Baby Products)
            {"name": "पाम्पर्स", "category": "बच्चाको सामग्री", "price": 300, "unit": "प्याकेट"},
            {"name": "बेबी लोसन", "category": "बच्चाको सामग्री", "price": 250, "unit": "बोतल"},
            {"name": "बेबी पाउडर", "category": "बच्चाको सामग्री", "price": 180, "unit": "बोतल"},
            {"name": "बेबी साबुन", "category": "बच्चाको सामग्री", "price": 60, "unit": "पिस"},

            # अन्य (Others)
            {"name": "मोमबत्ती", "category": "अन्य", "price": 20, "unit": "प्याकेट"},
            {"name": "म्याचिस", "category": "अन्य", "price": 5, "unit": "प्याकेट"},
            {"name": "प्लास्टिक झोला", "category": "अन्य", "price": 10, "unit": "पिस"},
            {"name": "अल्मुनियम फोइल", "category": "अन्य", "price": 90, "unit": "रोल"},
        ]
        
        # Step 4: Insert new products
        print("Inserting new products...")
        for product_info in products_data:
            product = Product(
                product_id=str(uuid.uuid4()),
                shop_id=shop_id,
                product_name=product_info["name"],
                category=product_info["category"],
                price=product_info["price"],
                unit=product_info["unit"],
                current_stock=get_realistic_stock(product_info["unit"], product_info["category"]),
                is_active=True
            )
            session.add(product)
        
        session.commit()
        print(f"Successfully inserted {len(products_data)} products!")
        
    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    main()