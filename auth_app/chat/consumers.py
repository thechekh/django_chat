import json
from django.db import models
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Room, Message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"chat_{self.room_name}"

        # Verify authentication
        if not self.scope.get("user").is_authenticated:
            await self.close()
            return

        # Ensure the room exists or create it
        await self.get_or_create_room()

        await self.channel_layer.group_add(
            self.room_group_name, self.channel_name
        )
        await self.accept()

        # Update room users count
        await self.update_user_count(1)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name, self.channel_name
        )
        await self.update_user_count(-1)

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]

        # Save message to database
        await self.save_message(message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "user": self.scope["user"].username,
            },
        )
        # Send notifications to other users in the room.
        user_ids = await self.get_other_user_ids()
        for uid in user_ids:
            await self.channel_layer.group_send(
                f"notifications_{uid}",
                {
                    "type": "notify",
                    "message": message,
                    "room": self.room_name,
                    "sender": self.scope["user"].username,
                },
            )

    async def chat_message(self, event):
        await self.send(
            text_data=json.dumps(
                {"message": event["message"], "user": event["user"]}
            )
        )

    @database_sync_to_async
    def get_or_create_room(self):
        room, created = Room.objects.get_or_create(
            name=self.room_name, defaults={"created_by": self.scope["user"]}
        )
        return room

    @database_sync_to_async
    def update_user_count(self, increment):
        room = Room.objects.get(name=self.room_name)
        room.users_amount = models.F("users_amount") + increment
        room.save()

    @database_sync_to_async
    def save_message(self, content):
        room = Room.objects.get(name=self.room_name)
        Message.objects.create(
            room=room, user=self.scope["user"], content=content
        )

    @database_sync_to_async
    def get_other_user_ids(self):
        room = Room.objects.get(name=self.room_name)
        # Assume joined_users is a ManyToManyField on Room;
        # Exclude the sender.
        return list(
            room.joined_users.exclude(id=self.scope["user"].id).values_list(
                "id", flat=True
            )
        )
