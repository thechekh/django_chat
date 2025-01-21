from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User, UserProfile, UserFriends


class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "first_name", "last_name", "is_staff")


class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "age", "location")


class UserFriendsAdmin(admin.ModelAdmin):
    list_display = ("user", "friend", "created_at")


admin.site.register(User, CustomUserAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(UserFriends, UserFriendsAdmin)
