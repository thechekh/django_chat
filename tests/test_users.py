from werkzeug.security import generate_password_hash

from models import db, User
from helpers import get_token


def test_get_users_as_admin(test_client, add_user):
    with test_client.application.app_context():
        admin_user = add_user
        token = get_token(test_client, admin_user)

        response = test_client.get(
            "/users", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        assert isinstance(response.json, list)
        assert len(response.json) > 0
        for user in response.json:
            assert "id" in user
            assert "username" in user
            assert "role" in user

        usernames = [user["username"] for user in response.json]
        assert admin_user.username in usernames


def test_get_user_by_id_as_admin(test_client, add_user):
    with test_client.application.app_context():
        admin_user = add_user
        token = get_token(test_client, admin_user)

        user_to_get = User(
            username="user_to_view",
            password=generate_password_hash("password"),
            role_id=1,
        )
        db.session.add(user_to_get)
        db.session.commit()

        response = test_client.get(
            f"/users/{user_to_get.id}", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        assert response.json["id"] == user_to_get.id
        assert response.json["username"] == user_to_get.username
        assert response.json["role"] == user_to_get.role.name

        db.session.delete(user_to_get)
        db.session.commit()


def test_create_user_as_admin(test_client, add_user):
    with test_client.application.app_context():
        admin_user = add_user
        token = get_token(test_client, admin_user)

        new_user_data = {
            "username": "new_admin",
            "password": "newpassword",
            "role": "admin",
        }

        response = test_client.post(
            "/users", json=new_user_data, headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 201
        assert response.json["message"] == "User created successfully"

        new_user = User.query.filter_by(username=new_user_data["username"]).first()
        assert new_user is not None
        assert new_user.username == new_user_data["username"]
        assert new_user.role.name == new_user_data["role"]

        db.session.delete(new_user)
        db.session.commit()


def test_update_user_as_admin(test_client, add_user):
    with test_client.application.app_context():
        admin_user = add_user
        token = get_token(test_client, admin_user)

        user_to_update = User(
            username="old_username",
            password=generate_password_hash("oldpassword"),
            role_id=1,
        )
        db.session.add(user_to_update)
        db.session.commit()

        updated_data = {
            "username": "updated_username",
            "password": "newpassword",
            "role": "admin",
        }

        response = test_client.put(
            f"/users/{user_to_update.id}",
            json=updated_data,
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        assert response.json["message"] == "User updated successfully"

        updated_user = db.session.get(User, user_to_update.id)
        assert updated_user.username == updated_data["username"]
        assert updated_user.role.name == updated_data["role"]

        db.session.delete(updated_user)
        db.session.commit()


def test_delete_user_as_admin(test_client, add_user):
    with test_client.application.app_context():
        admin_user = add_user
        token = get_token(test_client, admin_user)

        user_to_delete = User(
            username="delete_me", password=generate_password_hash("password"), role_id=1
        )
        db.session.add(user_to_delete)
        db.session.commit()

        response = test_client.delete(
            f"/users/{user_to_delete.id}", headers={"Authorization": f"Bearer {token}"}
        )

        assert response.status_code == 200
        assert response.json["message"] == "User deleted successfully"

        deleted_user = db.session.get(User, user_to_delete.id)
        assert deleted_user is None
