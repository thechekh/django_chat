import json
from channels.generic.websocket import AsyncWebsocketConsumer


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if (
            not self.scope.get("user")
            or not self.scope["user"].is_authenticated
        ):
            await self.close()
            return

        self.notification_group_name = f"notifications_{self.scope['user'].id}"
        await self.channel_layer.group_add(
            self.notification_group_name, self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.notification_group_name, self.channel_name
        )

    async def notify(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    "notification": event["message"],
                    "room": event["room"],
                    "sender": event["sender"],
                }
            )
        )
