from rest_framework import serializers
from .models import Room, Message


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = [
            "id",
            "name",
            "created_at",
            "users_amount",
            "created_by",
            "joined_users",
        ]
        read_only_fields = ["created_by", "users_amount", "joined_users"]


class MessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    reactions = serializers.JSONField(read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "room",
            "user",
            "username",
            "content",
            "timestamp",
            "reactions",
        ]
        read_only_fields = ["user", "reactions"]
