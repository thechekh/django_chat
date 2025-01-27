from rest_framework import serializers

from .models import UserProfile, User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    age = serializers.IntegerField(required=True)
    location = serializers.CharField(required=False, allow_blank=True)
    interests = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "age",
            "location",
            "interests",
        ]

    def create(self, validated_data):
        password = validated_data.pop("password")
        age = validated_data.pop("age")
        location = validated_data.pop("location", "")
        interests = validated_data.pop("interests", "")

        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        UserProfile.objects.get_or_create(
            user=user, defaults={"age": age, "location": location, "interests": interests}
        )

        return user


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = UserProfile
        fields = ["username", "email", "age", "location", "interests"]
