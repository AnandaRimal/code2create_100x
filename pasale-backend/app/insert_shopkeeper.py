import uuid
from sqlalchemy import create_engine, Column, String, TIMESTAMP
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.sql import func
import random
from datetime import datetime, timedelta

# Database configuration - UPDATE WITH YOUR ACTUAL CREDENTIALS
DATABASE_URL = "mysql+pymysql://root:root@localhost/pasale_db"
# Or for PostgreSQL: "postgresql://username:password@localhost/your_database"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Shopkeeper(Base):
    __tablename__ = "shopkeepers"
    
    shop_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    shop_name = Column(String(255), nullable=False)
    shop_address = Column(String(255))
    contact = Column(String(50), nullable=False)
    email = Column(String(320), unique=True, nullable=True)
    pan = Column(String(50), unique=True, nullable=True)
    password = Column(String(128), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    last_sync = Column(TIMESTAMP(timezone=True), nullable=True)

def generate_nepali_phone():
    """Generate realistic Nepali phone numbers"""
    prefixes = ['980', '981', '982', '984', '985', '986']
    return f"+977{random.choice(prefixes)}{random.randint(1000000, 9999999)}"

def generate_pan_number():
    """Generate realistic PAN numbers"""
    letters = ''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ', k=5))
    numbers = ''.join(random.choices('0123456789', k=4))
    letter = random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    return f"{letters}{numbers}{letter}"

def generate_password():
    """Generate hashed password (using simple hash for demo)"""
    return "hashed_password_123"  # In real app, use proper hashing like bcrypt

def main():
    session = SessionLocal()
    
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        print("Tables created/verified successfully!")
        
        # Define 10 realistic Nepali shopkeepers
        shopkeepers_data = [
            {
                "shop_name": "सुनकोसी किराना पसल",
                "owner_name": "राम बहादुर थापा",
                "area": "काठमाडौं",
                "address": "नयाँबजार, काठमाडौं"
            },
            {
                "shop_name": "गणेश स्टोर",
                "owner_name": "हरि प्रसाद श्रेष्ठ",
                "area": "ललितपुर",
                "address": "पाटन, ललितपुर"
            },
            {
                "shop_name": "अन्नपूर्ण किराना",
                "owner_name": "सीता कुमारी महर्जन",
                "area": "भक्तपुर",
                "address": "भक्तपुर दरबार क्षेत्र, भक्तपुर"
            },
            {
                "shop_name": "माछापुच्छ्रे किराना",
                "owner_name": "गोपाल गुरुङ",
                "area": "पोखरा",
                "address": "लेकसाइड, पोखरा"
            },
            {
                "shop_name": "जनकपुर किराना स्टोर",
                "owner_name": "कृष्ण कुमार यादव",
                "area": "जनकपुर",
                "address": "जनकपुर धाम, धनुषा"
            },
            {
                "shop_name": "बिराटनगर किराना",
                "owner_name": "राजेश हमाल",
                "area": "बिराटनगर",
                "address": "बिराटनगर-१०, मोरंग"
            },
            {
                "shop_name": "लुम्बिनी किराना",
                "owner_name": "बुद्ध कुमार शाक्य",
                "area": "लुम्बिनी",
                "address": "लुम्बिनी, रुपन्देही"
            },
            {
                "shop_name": "मेची किराना पसल",
                "owner_name": "सुरेश राई",
                "area": "ईलाम",
                "address": "ईलाम बजार, ईलाम"
            },
            {
                "shop_name": "कर्णाली किराना",
                "owner_name": "दिपेन्द्र बुढा",
                "area": "नेपालगञ्ज",
                "address": "नेपालगञ्ज, बाँके"
            },
            {
                "shop_name": "हिमालय किराना",
                "owner_name": "मीन बहादुर गुरुङ",
                "area": "धनकुटा",
                "address": "धनकुटा बजार, धनकुटा"
            }
        ]
        
        print("Inserting shopkeepers...")
        
        for i, shop_data in enumerate(shopkeepers_data, 1):
            # Generate unique email
            email = f"{shop_data['owner_name'].replace(' ', '').lower()}@gmail.com"
            
            shopkeeper = Shopkeeper(
                shop_id=str(uuid.uuid4()),
                shop_name=shop_data["shop_name"],
                shop_address=shop_data["address"],
                contact=generate_nepali_phone(),
                email=email,
                pan=generate_pan_number(),
                password=generate_password(),
                last_sync=datetime.now() - timedelta(days=random.randint(0, 7))
            )
            
            session.add(shopkeeper)
            print(f"{i}. {shop_data['shop_name']} - {shop_data['owner_name']}")
        
        session.commit()
        print(f"\n✅ Successfully inserted {len(shopkeepers_data)} Nepali shopkeepers!")
        
        # Display inserted shopkeepers
        print("\n📋 Inserted Shopkeepers:")
        print("-" * 80)
        shopkeepers = session.query(Shopkeeper).all()
        for sk in shopkeepers:
            print(f"🏪 {sk.shop_name}")
            print(f"   📍 {sk.shop_address}")
            print(f"   📞 {sk.contact}")
            print(f"   📧 {sk.email}")
            print(f"   🆔 PAN: {sk.pan}")
            print(f"   🆔 Shop ID: {sk.shop_id}")
            print()
            
    except Exception as e:
        session.rollback()
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()

if __name__ == "__main__":
    main()