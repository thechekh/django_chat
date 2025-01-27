from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    pass


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    age = models.PositiveIntegerField(null=True, blank=True)
    location = models.CharField(max_length=100, blank=True)
    interests = models.TextField(blank=True)


class UserFriends(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friendship_creator"
    )
    friend = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="friendship_friend"
    )
    created_at = models.DateTimeField(auto_now_add=True)


class BlacklistedToken(models.Model):
    token = models.CharField(max_length=255, unique=True)
    blacklisted_at = models.DateTimeField(auto_now_add=True)
