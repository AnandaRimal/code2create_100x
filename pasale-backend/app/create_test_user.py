import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models.shopkeeper import Shopkeeper
from app.models.product import Product
from app.utils.security import hash_password

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_test_shopkeeper():
    session = SessionLocal()
    
    try:
        # Check if test shopkeeper already exists
        existing = session.query(Shopkeeper).filter(Shopkeeper.contact == "9800000001").first()
        
        if existing:
            print("Updating existing shopkeeper password...")
            # Update password for the existing shopkeeper
            existing.password = hash_password("password123")
            session.commit()
            print(f"Updated password for: {existing.shop_name}")
            shop_id = existing.shop_id
        else:
            print("Creating new test shopkeeper...")
            # Create new shopkeeper with hashed password
            test_shopkeeper = Shopkeeper(
                shop_name="Test Shop for Products",
                shop_address="Test Location",
                contact="9800000999",
                email="test@example.com",
                password=hash_password("password123")
            )
            session.add(test_shopkeeper)
            session.commit()
            print(f"Created new shopkeeper: {test_shopkeeper.shop_name}")
            shop_id = test_shopkeeper.shop_id
        
        # Move all products from old shop to this shop
        print("Moving products to test shopkeeper...")
        old_shop_id = "2ff48078-fdf7-4221-8fbc-99c07e12b698"  # shyam dai ko pasal
        products_moved = session.query(Product).filter(Product.shop_id == old_shop_id).update(
            {Product.shop_id: shop_id}
        )
        session.commit()
        
        print(f"Moved {products_moved} products to test shopkeeper")
        
        # Verify the setup
        product_count = session.query(Product).filter(Product.shop_id == shop_id).count()
        print(f"Total products for test shopkeeper: {product_count}")
        
        return shop_id
        
    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
        return None
    finally:
        session.close()

if __name__ == "__main__":
    create_test_shopkeeper()