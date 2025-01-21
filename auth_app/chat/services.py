import requests
from django.conf import settings

MATRIX_BASE_URL = "http://localhost:8008"
MATRIX_ADMIN_TOKEN = "my_secret"


class MatrixAPI:
    @staticmethod
    def create_room(name, user_id):
        """Create a new room."""
        url = f"{MATRIX_BASE_URL}/_matrix/client/r0/createRoom"
        headers = {"Authorization": f"Bearer {MATRIX_ADMIN_TOKEN}"}
        payload = {
            "room_alias_name": name,
            "visibility": "private",
            "invite": [user_id],
        }
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()

    @staticmethod
    def delete_room(room_id):
        """Delete a room."""
        url = f"{MATRIX_BASE_URL}/_matrix/client/r0/rooms/{room_id}/state/m.room.name"
        headers = {"Authorization": f"Bearer {MATRIX_ADMIN_TOKEN}"}
        response = requests.delete(url, headers=headers)
        response.raise_for_status()
        return response.json()

    @staticmethod
    def add_user_to_room(room_id, user_id):
        """Invite a user to a room."""
        url = f"{MATRIX_BASE_URL}/_matrix/client/r0/rooms/{room_id}/invite"
        headers = {"Authorization": f"Bearer {MATRIX_ADMIN_TOKEN}"}
        payload = {"user_id": user_id}
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()

    @staticmethod
    def list_rooms():
        """List public rooms (for testing)."""
        url = f"{MATRIX_BASE_URL}/_matrix/client/r0/publicRooms"
        headers = {"Authorization": f"Bearer {MATRIX_ADMIN_TOKEN}"}
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
