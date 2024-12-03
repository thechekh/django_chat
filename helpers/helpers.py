import os
import datetime
from datetime import timezone
from functools import wraps

from flask import request, jsonify, g
import jwt
from dotenv import load_dotenv

from models import db, User

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")

def get_token(test_client, user):
    response = test_client.post(
        "/login",
        json={"username": user.username, "password": "adminpass"},
    )
    return response.json["token"]

def generate_token(user_id, role):
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.datetime.now(timezone.utc) + datetime.timedelta(hours=24),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def decode_token(token):
    try:
        if token.startswith("Bearer "):
            token = token[7:]
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    @wraps(f)
    def decorator(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Unauthorized"}), 403
        payload = decode_token(token)
        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 403
        user = db.session.get(User, payload["user_id"])
        if not user:
            return jsonify({"error": "User not found"}), 404
        g.current_user = user
        g.current_role = payload["role"]
        return f(*args, **kwargs)

    return decorator
