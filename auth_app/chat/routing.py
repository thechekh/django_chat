from django.urls import re_path
from . import consumers, consumers_notification

websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<room_name>\w+)/$", consumers.ChatConsumer.as_asgi()),
    re_path(
        r"ws/notifications/$",
        consumers_notification.NotificationConsumer.as_asgi(),
    ),
]
