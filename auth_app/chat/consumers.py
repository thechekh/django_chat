# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Room, Message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        print(f"Connecting to room: {self.room_name}")

        # Check if user is authenticated
        if self.scope["user"].is_anonymous:
            await self.close()
            return

        # Get or create room
        self.room = await self.get_or_create_room()

        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()
        print(f"Connected to room: {self.room_name}")

    @database_sync_to_async
    def get_or_create_room(self):
        room, _ = Room.objects.get_or_create(name=self.room_name)
        return room

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Save message to database
        await self.save_message(message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "user": self.scope["user"].username,
            },
        )

    async def chat_message(self, event):
        message = event["message"]
        user = event["user"]

        # Send message to WebSocket
        await self.send(
            text_data=json.dumps({"message": message, "user": user})
        )

    @database_sync_to_async
    def save_message(self, message):
        Message.objects.create(
            room=self.room, user=self.scope["user"], content=message
        )
