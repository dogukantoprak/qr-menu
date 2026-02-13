from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.models import db, Restaurant, Table, User, Category, MenuItem
from app.decorators import owner_required
import uuid

admin_bp = Blueprint('admin_features', __name__)

# --- SETTINGS ENDPOINTS ---

@admin_bp.route('/settings', methods=['GET'])
@jwt_required()
def get_settings():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    restaurant = Restaurant.query.get(user.restaurant_id)

    return jsonify({
        'name': restaurant.name,
        'theme_color': restaurant.theme_color,
        'wifi_ssid': restaurant.wifi_ssid,
        'wifi_password': restaurant.wifi_password,
        'currency': 'TRY' # fixed for now
    })

@admin_bp.route('/settings', methods=['PUT'])
@jwt_required()
def update_settings():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    restaurant = Restaurant.query.get(user.restaurant_id)
    
    data = request.json
    
    if 'name' in data: restaurant.name = data['name']
    if 'theme_color' in data: restaurant.theme_color = data['theme_color']
    if 'wifi_ssid' in data: restaurant.wifi_ssid = data['wifi_ssid']
    if 'wifi_password' in data: restaurant.wifi_password = data['wifi_password']
    
    db.session.commit()
    return jsonify({'msg': 'Settings updated'})

# --- TABLE ENDPOINTS ---

@admin_bp.route('/tables', methods=['GET'])
@jwt_required()
def get_tables():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    tables = Table.query.filter_by(restaurant_id=user.restaurant_id).all()
    return jsonify([{
        'id': t.id,
        'name': t.name,
        'token': t.token,
        'is_active': t.is_active,
        'url': f"/r/{user.restaurant.slug}?t={t.token or t.id}" # Simplified logical URL
    } for t in tables])

@admin_bp.route('/tables', methods=['POST'])
@jwt_required()
def create_table():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    data = request.json
    
    # Generate simple token or use name
    token = str(uuid.uuid4())[:8]
    
    new_table = Table(
        restaurant_id=user.restaurant_id,
        name=data.get('name', f"Table {len(user.restaurant.tables) + 1}"),
        token=token,
        is_active=True
    )
    
    db.session.add(new_table)
    db.session.commit()
    
    return jsonify({'id': new_table.id, 'name': new_table.name, 'token': new_table.token}), 201

@admin_bp.route('/tables/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_table(id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    table = Table.query.filter_by(id=id, restaurant_id=user.restaurant_id).first()
    if not table:
        return jsonify({'msg': 'Table not found'}), 404
        

# --- DEMO SEED DATA ---

@admin_bp.route('/seed-demo', methods=['POST'])
@jwt_required() # Protect this
def seed_demo_data():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    restaurant = Restaurant.query.get(user.restaurant_id)
    
    # 1. Ensure Categories exist
    cats_data = ["Başlangıçlar", "Ana Yemekler", "İçecekler", "Tatlılar"]
    categories = {}
    
    for idx, name in enumerate(cats_data):
        cat = Category.query.filter_by(restaurant_id=restaurant.id, name=name).first()
        if not cat:
            cat = Category(restaurant_id=restaurant.id, name=name, sort_order=idx+1)
            db.session.add(cat)
            db.session.flush()
        categories[name] = cat

    # 2. Ensure Items exist
    # Helper to add item
    def add_item(cat_name, name, desc, price, img):
        cat = categories.get(cat_name)
        if not cat: return
        
        if not MenuItem.query.filter_by(restaurant_id=restaurant.id, name=name).first():
            item = MenuItem(
                restaurant_id=restaurant.id,
                category_id=cat.id,
                name=name,
                description=desc,
                price=price,
                image_url=img,
                is_active=True
            )
            db.session.add(item)

    # Başlangıçlar
    add_item("Başlangıçlar", "Mercimek Çorbası", "Geleneksel süzme mercimek çorbası, kızarmış ekmek ile.", 120.0, "https://images.unsplash.com/photo-1547592166-23acbe3226bf?w=500&q=80")
    add_item("Başlangıçlar", "Paçanga Böreği", "Pastırmalı ve kaşarlı çıtır börek.", 180.0, "https://images.unsplash.com/photo-1626804475297-411d8c6b553e?w=500&q=80")

    # Ana Yemekler
    add_item("Ana Yemekler", "Izgara Köfte", "Dana kıymadan özel baharatlarla hazırlanmış ızgara köfte. Pilav ile.", 450.0, "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=500&q=80")
    add_item("Ana Yemekler", "Tavuk Şiş", "Marine edilmiş yumuşak tavuk göğsü şişleri.", 380.0, "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&q=80")
    
    # İçecekler
    add_item("İçecekler", "Ev Yapımı Limonata", "Taze naneli ferahlatıcı limonata.", 90.0, "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80")
    add_item("İçecekler", "Ayran", "Yayık ayranı, bol köpüklü.", 50.0, "https://images.unsplash.com/photo-1626139589334-a16f9fa12613?w=500&q=80")

    # Tatlılar
    add_item("Tatlılar", "Fıstıklı Baklava", "Antep fıstıklı çıtır baklava (3 dilim).", 220.0, "https://images.unsplash.com/photo-1597075687490-8f673c6c17f6?w=500&q=80")
    add_item("Tatlılar", "Sütlaç", "Fırınlanmış köy sütlacı.", 140.0, "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=500&q=80")

    db.session.commit()
    return jsonify({"msg": "Demo data seeded successfully", "restaurant": restaurant.name})

