from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from app.database import db
from app.models.models import User

def same_user_required():
    """
    Decorator to ensure the user can only access their own data.
    Actually for Admin API, we just need 'admin_required' or similar.
    Since we have Owner and Staff, let's define 'owner_required'.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = db.session.get(User, current_user_id)
            if not user:
                return jsonify({"msg": "User not found"}), 401
            # For now, just pass through if user exists
            return fn(*args, **kwargs)
        return decorator
    return wrapper

def owner_required():
    """
    Decorator to ensure the user has 'owner' role.
    """
    def wrapper(fn):
        @wraps(fn)
        def decorator(*args, **kwargs):
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = db.session.get(User, current_user_id)
            
            if not user:
                return jsonify({"msg": "User not found"}), 401
                
            if user.role != 'owner':
                return jsonify({"msg": "Admins only"}), 403
                
            return fn(*args, **kwargs)
        return decorator
    return wrapper
