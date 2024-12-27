from flask import Blueprint, jsonify, request, g
from werkzeug.security import check_password_hash, generate_password_hash

from helpers import generate_token, token_required
from models import db, User

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


@bp.route("/signup", methods=["POST"])
def signup():
    username = request.json.get("username")
    password = request.json.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 400

    hashed_password = generate_password_hash(password)
    user = User(username=username, password=hashed_password, role="VIEWER")

    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id, user.role)
    return jsonify({"token": token}), 201


@bp.route("/refresh", methods=["POST"])
@token_required
def refresh():
    user = g.current_user
    new_token = generate_token(user.id, user.role)
    return jsonify({"token": new_token}), 200
