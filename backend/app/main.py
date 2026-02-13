import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash
from flask_cors import CORS
from app.database import db
from app.models.models import Restaurant, User, Category, MenuItem
from app.routers.auth import auth_bp
from app.routers.admin import admin_bp
from app.routers.public import public_bp

load_dotenv()

app = Flask(__name__)

# Database Config (SQLite fallback / Postgres fix)
database_url = os.getenv("DATABASE_URL", "sqlite:///qrmenu.db")
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
app.config["SQLALCHEMY_DATABASE_URI"] = database_url

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-key")
app.config["UPLOAD_FOLDER"] = os.path.join(app.root_path, "static", "uploads")
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

db.init_app(app)
jwt = JWTManager(app)

# CORS: Allow * in Dev, specific origin in Prod
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
# Allow localhost and any cloudflare tunnel subdomain
origins = [frontend_url, "http://localhost:5173", "http://127.0.0.1:5173", r"^https://.*\.trycloudflare\.com$"]
if frontend_url == "*": origins = "*"

CORS(app, resources={r"/api/*": {"origins": origins}}, supports_credentials=True)

# Note: We removed the manual handle_preflight to let Flask-CORS handle it exclusively.

# Register Blueprints with /api prefix
# Note: Blueprints already have internal prefixes like /auth, /admin, /public
# So we just mount them under /api to get /api/auth, /api/admin, etc.

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(public_bp, url_prefix='/api/public')

from app.routers.orders import orders_bp
app.register_blueprint(orders_bp, url_prefix='/api')

from app.routers.admin_features import admin_bp as admin_features_bp
app.register_blueprint(admin_features_bp, url_prefix='/api/admin')

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "qr-menu-backend"})

# --- Seeding ---
def seed_data():
    if Restaurant.query.first():
        # Check if we need to seed categories/items for existing restaurant
        demo = Restaurant.query.filter_by(slug="demo-restoran").first()
        if demo and not Category.query.filter_by(restaurant_id=demo.id).first():
            print("Seeding extra data for existing restaurant...")
            seed_menu_items(demo)
        return
    
    # Create Restaurant
    demo = Restaurant(name="Demo Restoran", slug="demo-restoran")
    db.session.add(demo)
    db.session.commit()
    
    # Create User
    owner = User(
        restaurant_id=demo.id,
        email="owner@demo.com",
        password_hash=generate_password_hash("123456"),
        role="owner"
    )
    db.session.add(owner)
    
    seed_menu_items(demo)
    db.session.commit()
    print("Database seeded with initial data.")

def seed_menu_items(restaurant):
    cats = ["Başlangıçlar", "Ana Yemekler", "İçecekler"]
    for idx, name in enumerate(cats):
        c = Category(restaurant_id=restaurant.id, name=name, sort_order=idx+1)
        db.session.add(c)
        db.session.flush() # get ID
        
        # Add 2 items
        for i in range(1, 3):
            item = MenuItem(
                restaurant_id=restaurant.id,
                category_id=c.id,
                name=f"{name} Ürün {i}",
                description=f"Lezzetli {name.lower()} {i}",
                price=100.0 * (idx + 1) + (i * 10),
                sort_order=i,
                image_url="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80"
            )
            db.session.add(item)

def init_db():
    with app.app_context():
        # db.drop_all() # Uncomment to reset
        db.create_all()
        seed_data()

init_db()

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "QR Menu API is running"})

@app.route("/debug/db", methods=["GET"])
def debug_db():
    restaurant = Restaurant.query.first()
    user = User.query.first()
    return jsonify({
        "restaurant": restaurant.name if restaurant else None,
        "owner": user.email if user else None
    })

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=os.getenv("FLASK_DEBUG") == "1")
