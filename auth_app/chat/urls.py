# chat/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path(
        "api/rooms/",
        views.RoomViewSet.as_view({"get": "list", "post": "create"}),
    ),
    path("api/messages/", views.MessageViewSet.as_view({"get": "list"})),
]
