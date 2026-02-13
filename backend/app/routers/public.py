from flask import Blueprint, jsonify
from sqlalchemy.orm import joinedload
from app.models.models import Restaurant, Category, MenuItem

public_bp = Blueprint('public', __name__)

@public_bp.route("/restaurants/<string:slug>/menu", methods=["GET"])
def get_menu(slug):
    restaurant = Restaurant.query.filter_by(slug=slug).first_or_404()
    
    # Fetch active categories and items efficiently
    categories = Category.query.filter_by(
        restaurant_id=restaurant.id, is_active=True
    ).order_by(Category.sort_order).options(
        joinedload(Category.items)
    ).all()
    
    response_categories = []
    for cat in categories:
        # Filter active items in Python to avoid complex efficient queries for now (list is small)
        active_items = [
            {
                "id": i.id, "name": i.name, "description": i.description,
                "price": i.price, "currency": i.currency, "image_url": i.image_url,
                "sort_order": i.sort_order
            }
            for i in cat.items if i.is_active
        ]
        # Sort items
        active_items.sort(key=lambda x: (x["sort_order"], x["id"]))
        
        if active_items: # Optional: only show categories with items? Requirement says "active categories", assuming all.
            pass

        response_categories.append({
            "id": cat.id,
            "name": cat.name,
            "items": active_items
        })
        
    return jsonify({
        "restaurant_name": restaurant.name,
        "slug": restaurant.slug,
        "categories": response_categories
    })
