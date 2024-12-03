import pytest

def test_login_success(test_client, add_user):
    with test_client.application.app_context():
        user = add_user
        response = test_client.post(
            "/login",
            json={"username": user.username, "password": "adminpass"},
        )
        assert response.status_code == 200
        assert "token" in response.json


def test_login_failure(test_client, add_user):
    with test_client.application.app_context():
        user = add_user
        response = test_client.post(
            "/login",
            json={"username": user.username, "password": "wrongpassword"},
        )
        assert response.status_code == 401
        assert "error" in response.json
        assert response.json["error"] == "Invalid username or password"


@pytest.mark.parametrize(
    "json_payload, expected_message",
    [
        ({"password": "adminpass"}, "Username and password are required"),
        ({"username": "admin"}, "Username and password are required"),
        ({}, "Username and password are required"),
    ],
)
def test_login_missing_fields(test_client, json_payload, expected_message):
    response = test_client.post("/login", json=json_payload)
    assert response.status_code == 400
    assert "error" in response.json
    assert response.json["error"] == expected_message
