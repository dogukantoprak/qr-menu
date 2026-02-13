from flask import Blueprint, request, jsonify
from app.database import db
from app.models.models import Order, OrderItem, MenuItem, Restaurant
from flask_jwt_extended import jwt_required, get_jwt_identity

orders_bp = Blueprint("orders", __name__)

# --- Public Endpoints ---

@orders_bp.route("/public/orders", methods=["POST"])
def create_order():
    data = request.get_json()
    
    # Validation
    slug = data.get("restaurantSlug")
    table_number = data.get("tableNumber")
    items = data.get("items") # list of { menuItemId, quantity }
    note = data.get("note", "")

    if not slug or not table_number or not items:
        return jsonify({"error": "Missing required fields"}), 400
    
    restaurant = Restaurant.query.filter_by(slug=slug).first()
    if not restaurant:
        return jsonify({"error": "Restaurant not found"}), 404
        
    # Calculate Total Server-Side
    total_amount = 0.0
    order_items = []
    
    for item_data in items:
        menu_item_id = item_data.get("menuItemId")
        qty = item_data.get("quantity", 0)
        
        if qty < 1:
            continue
            
        menu_item = MenuItem.query.filter_by(id=menu_item_id, restaurant_id=restaurant.id).first()
        if not menu_item:
            continue
            
        line_total = menu_item.price * qty
        total_amount += line_total
        
        order_items.append(OrderItem(
            menu_item_id=menu_item.id,
            quantity=qty,
            unit_price=menu_item.price,
            line_total=line_total
        ))
    
    if not order_items:
        return jsonify({"error": "No valid items in order"}), 400
        
    # Create Order
    new_order = Order(
        restaurant_id=restaurant.id,
        table_number=table_number,
        total_amount=total_amount,
        note=note,
        status="PENDING"
    )
    db.session.add(new_order)
    db.session.flush() # Get ID
    
    for oi in order_items:
        oi.order_id = new_order.id
        db.session.add(oi)
        
    db.session.commit()
    
    return jsonify({
        "message": "Order placed successfully", 
        "orderId": new_order.id,
        "total": total_amount,
        "table": table_number
    }), 201

@orders_bp.route("/public/orders/<int:order_id>", methods=["GET"])
def get_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    return jsonify({
        "id": order.id,
        "status": order.status,
        "table": order.table_number,
        "total": order.total_amount,
        "createdAt": order.created_at,
        "items": [
            {
                "name": i.menu_item.name,
                "quantity": i.quantity,
                "total": i.line_total
            } for i in order.items
        ]
    })

# --- Admin Endpoints ---

@orders_bp.route("/admin/orders", methods=["GET"])
@jwt_required()
def get_admin_orders():
    # In a real app, strict checks on 'restaurant_id' from JWT if multi-tenant
    # For now, we return all orders (or filter by generic)
    orders = Order.query.order_by(Order.created_at.desc()).all()
    
    return jsonify([{
        "id": o.id,
        "table": o.table_number,
        "total": o.total_amount,
        "status": o.status,
        "itemsCount": len(o.items),
        "note": o.note,
        "createdAt": o.created_at,
        "items": [
            {
                "name": i.menu_item.name, 
                "quantity": i.quantity,
                "unit_price": i.unit_price
            } for i in o.items
        ]
    } for o in orders])

@orders_bp.route("/admin/orders/<int:order_id>/status", methods=["PUT"])
@jwt_required()
def update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json()
    new_status = data.get("status")
    
    if new_status not in ["PENDING", "ACCEPTED", "PREPARING", "READY", "SERVED", "CANCELLED"]:
        return jsonify({"error": "Invalid status"}), 400
        
    order.status = new_status
    db.session.commit()
    
    return jsonify({"message": "Status updated", "status": order.status})
