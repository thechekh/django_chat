from flask import Blueprint, jsonify, request, g
from werkzeug.security import generate_password_hash

from models import db, User, Role
from helpers import token_required

bp = Blueprint("users", __name__)


@bp.route("/users", methods=["GET"])
@token_required
def get_users():
    if g.current_role != "admin":
        return jsonify({"error": "Permission denied"}), 403

    search_term = request.args.get("q", "")
    if not search_term:
        users = db.session.query(User).all()
    else:
        users = (
            db.session.query(User)
            .filter(
                (User.username.ilike(f"%{search_term}%"))
                | (User.role.has(name=search_term))
            )
            .all()
        )

    return jsonify(
        [{"id": u.id, "username": u.username, "role": u.role.name} for u in users]
    )


@bp.route("/users/<int:id>", methods=["GET"])
@token_required
def get_user_by_id(id):
    if g.current_role != "admin":
        return jsonify({"error": "Permission denied"}), 403
    user = db.session.get(User, id)

    if user is None:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"id": user.id, "username": user.username, "role": user.role.name})


@bp.route("/users", methods=["POST"])
@token_required
def create_user():
    if g.current_role != "admin":
        return jsonify({"error": "Permission denied"}), 403

    data = request.get_json()
    username = data["username"]
    password = data["password"]
    role_name = data["role"]

    role = Role.query.filter_by(name=role_name).first()
    if not role:
        return jsonify({"error": "Invalid role"}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password=hashed_password, role=role)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User created successfully"}), 201


@bp.route("/users/<int:id>", methods=["PUT"])
@token_required
def update_user(id):
    if g.current_role != "admin":
        return jsonify({"error": "Permission denied"}), 403

    user = db.session.get(User, id)

    if user is None:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()

    user.username = data.get("username", user.username)
    if "password" in data:
        user.password = generate_password_hash(data["password"])
    if "role" in data:
        user.role = Role.query.filter_by(name=data["role"]).first()

    db.session.commit()

    return jsonify({"message": "User updated successfully"}), 200


@bp.route("/users/<int:id>", methods=["DELETE"])
@token_required
def delete_user(id):
    if g.current_role != "admin":
        return jsonify({"error": "Permission denied"}), 403

    user = db.session.get(User, id)

    if user is None:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200
