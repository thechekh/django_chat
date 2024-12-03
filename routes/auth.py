from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash

from helpers import generate_token
from models import User

bp = Blueprint("auth", __name__)


@bp.route("/login", methods=["POST"])
def login():
    username = request.json.get("username")
    password = request.json.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        token = generate_token(user.id, user.role.name)
        return jsonify({"token": token}), 200

    return jsonify({"error": "Invalid username or password"}), 401
