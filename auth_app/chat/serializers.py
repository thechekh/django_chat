from rest_framework import serializers
from .models import Room, Message


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ["id", "name", "created_at", "users_amount", "created_by"]
        read_only_fields = ["created_by", "users_amount"]


class MessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "room", "user", "username", "content", "timestamp"]
        read_only_fields = ["user"]
