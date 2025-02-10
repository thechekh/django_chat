from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Room(models.Model):
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    users_amount = models.IntegerField(default=0)
    joined_users = models.ManyToManyField(
        User, related_name="joined_rooms", blank=True
    )

    def __str__(self):
        return self.name


class Message(models.Model):
    room = models.ForeignKey(
        "Room", on_delete=models.CASCADE, related_name="messages"
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    reactions = models.JSONField(default=dict, blank=True)  # new field

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        return f"{self.user.username}: {self.content[:50]}"
