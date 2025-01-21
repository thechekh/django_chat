from django.shortcuts import render
from django.contrib.auth.decorators import login_required
import requests
from django.conf import settings


@login_required
def matrix_dashboard(request):
    access_token = settings.MATRIX_ACCESS_TOKEN

    rooms = []
    public_rooms = []
    users = []
    room_messages = {}
    room_names = {}

    if access_token:
        url = f"{settings.MATRIX_SERVER_URL}/_matrix/client/r0/joined_rooms"
        headers = {"Authorization": f"Bearer {access_token}"}
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            rooms = response.json().get("joined_rooms", [])
        except requests.RequestException as e:
            print(f"Error fetching rooms: {e}")

        public_rooms_url = (
            f"{settings.MATRIX_SERVER_URL}/_matrix/client/r0/publicRooms"
        )
        try:
            response = requests.get(public_rooms_url, headers=headers)
            response.raise_for_status()
            public_rooms = response.json().get("chunk", [])
        except requests.RequestException as e:
            print(f"Error fetching public rooms: {e}")

        for room_id in rooms:
            room_details_url = f"{settings.MATRIX_SERVER_URL}/_matrix/client/r0/rooms/{room_id}"
            try:
                response = requests.get(room_details_url, headers=headers)
                response.raise_for_status()
                room_name = response.json().get(
                    "name", room_id
                )
                room_names[room_id] = room_name
            except requests.RequestException as e:
                print(f"Error fetching room name for {room_id}: {e}")

            room_messages_url = f"{settings.MATRIX_SERVER_URL}/_matrix/client/r0/rooms/{room_id}/messages"
            params = {
                "access_token": access_token,
                "limit": 50,
            }
            try:
                response = requests.get(
                    room_messages_url, headers=headers, params=params
                )
                response.raise_for_status()
                messages = response.json().get("chunk", [])
                room_messages[room_id] = messages
            except requests.RequestException as e:
                print(f"Error fetching messages for room {room_id}: {e}")

    return render(
        request,
        "chat/matrix_dashboard.html",
        {
            "rooms": rooms,
            "public_rooms": public_rooms,
            "users": users,
            "room_messages": room_messages,
            "room_names": room_names,
        },
    )
