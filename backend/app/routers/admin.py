from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.database import db
from app.models.models import User, Category, MenuItem
from app.decorators import owner_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.before_request
@jwt_required()
def ensure_restaurant_context():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 401

def get_current_user_restaurant_id():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)
    return user.restaurant_id

@admin_bp.route("/ping", methods=["GET"])
def ping():
    current_user_id = get_jwt_identity()
    user = db.session.get(User, current_user_id)
    return jsonify({
        "ok": True,
        "restaurant_id": user.restaurant_id,
        "role": user.role
    })

# --- Categories CRUD ---
@admin_bp.route("/categories", methods=["GET"])
def list_categories():
    restaurant_id = get_current_user_restaurant_id()
    categories = Category.query.filter_by(restaurant_id=restaurant_id).order_by(Category.sort_order).all()
    return jsonify([{
        "id": c.id, "name": c.name, "sort_order": c.sort_order, "is_active": c.is_active
    } for c in categories])

@admin_bp.route("/categories", methods=["POST"])
@owner_required()
def create_category():
    restaurant_id = get_current_user_restaurant_id()
    data = request.json
    name = data.get("name")
    if not name:
        return jsonify({"msg": "Name required"}), 400
    
    cat = Category(
        restaurant_id=restaurant_id,
        name=name,
        sort_order=data.get("sort_order", 0),
        is_active=data.get("is_active", True)
    )
    db.session.add(cat)
    db.session.commit()
    return jsonify({"id": cat.id, "msg": "Category created"}), 201

@admin_bp.route("/categories/<int:cat_id>", methods=["PUT"])
@owner_required()
def update_category(cat_id):
    restaurant_id = get_current_user_restaurant_id()
    cat = Category.query.filter_by(id=cat_id, restaurant_id=restaurant_id).first_or_404()
    data = request.json
    
    if "name" in data: cat.name = data["name"]
    if "sort_order" in data: cat.sort_order = data["sort_order"]
    if "is_active" in data: cat.is_active = data["is_active"]
    
    db.session.commit()
    return jsonify({"msg": "Category updated"})

@admin_bp.route("/categories/<int:cat_id>", methods=["DELETE"])
@owner_required()
def delete_category(cat_id):
    restaurant_id = get_current_user_restaurant_id()
    cat = Category.query.filter_by(id=cat_id, restaurant_id=restaurant_id).first_or_404()
    
    # Block delete if items exist
    if MenuItem.query.filter_by(category_id=cat_id).count() > 0:
        return jsonify({"msg": "Cannot delete category with existing items"}), 400
        
    db.session.delete(cat)
    db.session.commit()
    return jsonify({"msg": "Category deleted"})

# --- Items CRUD ---
@admin_bp.route("/items", methods=["GET"])
def list_items():
    restaurant_id = get_current_user_restaurant_id()
    query = MenuItem.query.filter_by(restaurant_id=restaurant_id)
    
    cat_id = request.args.get("category_id")
    if cat_id:
        query = query.filter_by(category_id=cat_id)
        
    items = query.order_by(MenuItem.sort_order).all()
    return jsonify([{
        "id": i.id, "category_id": i.category_id, "name": i.name, 
        "price": i.price, "currency": i.currency, "description": i.description,
        "image_url": i.image_url,
        "is_active": i.is_active, "sort_order": i.sort_order
    } for i in items])

@admin_bp.route("/items", methods=["POST"])
@owner_required()
def create_item():
    restaurant_id = get_current_user_restaurant_id()
    data = request.json
    
    if not all(k in data for k in ("category_id", "name", "price")):
        return jsonify({"msg": "Missing required fields"}), 400

    # Validate category belongs to restaurant
    cat = Category.query.filter_by(id=data["category_id"], restaurant_id=restaurant_id).first()
    if not cat:
        return jsonify({"msg": "Invalid category"}), 400

    item = MenuItem(
        restaurant_id=restaurant_id,
        category_id=data["category_id"],
        name=data["name"],
        description=data.get("description"),
        price=data["price"],
        currency=data.get("currency", "TRY"),
        image_url=data.get("image_url"),
        sort_order=data.get("sort_order", 0),
        is_active=data.get("is_active", True)
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({"id": item.id, "msg": "Item created"}), 201

@admin_bp.route("/items/<int:item_id>", methods=["PUT"])
@owner_required()
def update_item(item_id):
    restaurant_id = get_current_user_restaurant_id()
    item = MenuItem.query.filter_by(id=item_id, restaurant_id=restaurant_id).first_or_404()
    data = request.json
    
    if "category_id" in data:
         cat = Category.query.filter_by(id=data["category_id"], restaurant_id=restaurant_id).first()
         if not cat: return jsonify({"msg": "Invalid category"}), 400
         item.category_id = data["category_id"]

    for k in ["name", "description", "price", "currency", "image_url", "sort_order", "is_active"]:
        if k in data:
            setattr(item, k, data[k])

    db.session.commit()
    return jsonify({"msg": "Item updated"})

@admin_bp.route("/items/<int:item_id>", methods=["DELETE"])
@owner_required()
def delete_item(item_id):
    restaurant_id = get_current_user_restaurant_id()
    item = MenuItem.query.filter_by(id=item_id, restaurant_id=restaurant_id).first_or_404()
    db.session.delete(item)
    db.session.commit()
    # Also clean up image if stored locally (not implemented here)
    return jsonify({"msg": "Item deleted"})

# --- Image Upload ---
from werkzeug.utils import secure_filename
import os
from flask import current_app

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@admin_bp.route("/upload", methods=["POST"])
@owner_required()
def upload_file():
    if 'file' not in request.files:
        return jsonify({"msg": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Create unique filename to prevent overwrite and caching
        import time
        unique_filename = f"{int(time.time())}_{filename}"
        
        file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename))
        
        # Generate URL
        # Assuming app serves static from /static
        url = f"{request.host_url}static/uploads/{unique_filename}"
        return jsonify({"url": url})
        
    return jsonify({"msg": "Invalid file type"}), 400
