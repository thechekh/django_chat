from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

from .views import UserRegistrationView, user_profile_view, logout_view

urlpatterns = [
    path(
        "token/", TokenObtainPairView.as_view(), name="token_obtain_pair"
    ),
    path(
        "token/refresh/", TokenRefreshView.as_view(), name="token_refresh"
    ),
    path(
        "token/blacklist/",
        TokenBlacklistView.as_view(),
        name="token_blacklist",
    ),
    path("register/", UserRegistrationView.as_view(), name="register"),
    path("profile/", user_profile_view, name="profile"),
    path("logout/", logout_view, name="logout"),
]
