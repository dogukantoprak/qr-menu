from app.main import app
from app.database import db
from app.models.models import Restaurant, User, Category, MenuItem
from werkzeug.security import generate_password_hash

def fix_data():
    with app.app_context():
        print("Checking database...")
        demo = Restaurant.query.filter_by(slug="demo-restoran").first()
        
        if not demo:
            print("Creating 'demo-restoran'...")
            demo = Restaurant(name="Demo Restoran", slug="demo-restoran")
            db.session.add(demo)
            db.session.commit()
            
            # Create Owner
            if not User.query.filter_by(email="owner@demo.com").first():
                owner = User(
                    restaurant_id=demo.id,
                    email="owner@demo.com",
                    password_hash=generate_password_hash("123456"),
                    role="owner"
                )
                db.session.add(owner)
        else:
            print(f"Found existing restaurant: {demo.name}")
            
        # Ensure Categories
        cats = ["Başlangıçlar", "Ana Yemekler", "İçecekler"]
        for idx, name in enumerate(cats):
            c = Category.query.filter_by(restaurant_id=demo.id, name=name).first()
            if not c:
                c = Category(restaurant_id=demo.id, name=name, sort_order=idx+1)
                db.session.add(c)
                db.session.flush()
                print(f"Created category: {name}")
                
                # Add Items
                for i in range(1, 3):
                    item = MenuItem(
                        restaurant_id=demo.id,
                        category_id=c.id,
                        name=f"{name} Ürün {i}",
                        description=f"Lezzetli {name} {i}",
                        price=100.0 * (idx + 1),
                        sort_order=i,
                        image_url="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
                        is_active=True
                    )
                    db.session.add(item)
        
        db.session.commit()
        print("Database fixed and seeded.")

if __name__ == "__main__":
    fix_data()
