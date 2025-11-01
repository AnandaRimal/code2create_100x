import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models.shopkeeper import Shopkeeper
from app.utils.security import hash_password

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def update_current_user_password():
    session = SessionLocal()
    
    try:
        # Update the current user's password
        current_user_id = 'eab694f7-712f-4fa0-b2d4-493140000548'
        user = session.query(Shopkeeper).filter(Shopkeeper.shop_id == current_user_id).first()
        
        if user:
            user.password = hash_password('password123')
            session.commit()
            print(f'Updated password for {user.shop_name} (Contact: {user.contact})')
            print('You can now login with:')
            print(f'  Contact: {user.contact}')
            print('  Password: password123')
        else:
            print('User not found')
            
    except Exception as e:
        session.rollback()
        print(f'Error: {e}')
        import traceback
        traceback.print_exc()
    finally:
        session.close()

if __name__ == "__main__":
    update_current_user_password()