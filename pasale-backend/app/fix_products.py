import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models.shopkeeper import Shopkeeper
from app.models.product import Product

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def fix_products_for_current_user():
    session = SessionLocal()
    
    try:
        # Get the current user (the one from the logs)
        current_user_id = "eab694f7-712f-4fa0-b2d4-493140000548"
        current_user = session.query(Shopkeeper).filter(Shopkeeper.shop_id == current_user_id).first()
        
        if not current_user:
            print(f"Current user {current_user_id} not found!")
            return
            
        print(f"Current user: {current_user.shop_name} (Contact: {current_user.contact})")
        
        # Check how many products they currently have
        current_product_count = session.query(Product).filter(Product.shop_id == current_user_id).count()
        print(f"Current products for this user: {current_product_count}")
        
        # Get the shop that has all the products
        old_shop_id = "2ff48078-fdf7-4221-8fbc-99c07e12b698"
        old_product_count = session.query(Product).filter(Product.shop_id == old_shop_id).count()
        print(f"Products in old shop: {old_product_count}")
        
        if old_product_count > 0:
            # Move all products to current user
            print(f"Moving {old_product_count} products to current user...")
            updated = session.query(Product).filter(Product.shop_id == old_shop_id).update(
                {Product.shop_id: current_user_id}
            )
            session.commit()
            print(f"Successfully moved {updated} products!")
            
            # Verify
            new_count = session.query(Product).filter(Product.shop_id == current_user_id).count()
            print(f"New product count for current user: {new_count}")
        else:
            print("No products to move!")
            
    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()

if __name__ == "__main__":
    fix_products_for_current_user()