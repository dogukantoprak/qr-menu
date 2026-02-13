from app.main import app
from app.database import db
from app.models.models import User, Restaurant

def check_seed():
    with app.app_context():
        print("Checking database state...")
        
        # Check Restaurant
        demo = Restaurant.query.filter_by(slug="demo-restoran").first()
        if demo:
            print(f"[OK] Restaurant found: {demo.name}")
        else:
            print("[MISSING] Restaurant 'demo-restoran' not found!")
            
        # Check User
        user = User.query.filter_by(email="owner@demo.com").first()
        if user:
            print(f"[OK] User found: {user.email}")
            print(f"     Role: {user.role}")
            print(f"     Password Hash: {user.password_hash[:10]}...")
        else:
            print("[MISSING] User 'owner@demo.com' not found!")

if __name__ == "__main__":
    check_seed()
