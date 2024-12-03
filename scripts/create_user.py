import argparse
from werkzeug.security import generate_password_hash

from app import create_app, db
from models import User, Role


def create_user(username, password, role_name):
    app = create_app()
    with app.app_context():
        role = Role.query.filter_by(name=role_name).first()
        if not role:
            print(f"Error: Role '{role_name}' does not exist.")
            return

        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            print(f"Error: User with username '{username}' already exists.")
            return

        new_user = User(
            username=username,
            password=generate_password_hash(password),
            role_id=role.id,
        )
        db.session.add(new_user)
        db.session.commit()
        print(f"User '{username}' with role '{role_name}' created successfully.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a new user in the database.")
    parser.add_argument(
        "--username", required=True, help="The username of the new user."
    )
    parser.add_argument(
        "--password", required=True, help="The password of the new user."
    )
    parser.add_argument(
        "--role",
        required=True,
        help="The role of the new user (e.g., admin, editor, viewer).",
    )

    args = parser.parse_args()

    create_user(args.username, args.password, args.role)
