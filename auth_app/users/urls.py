from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)

from .views import UserRegistrationView, user_profile_view, logout_view

urlpatterns = [
    path(
        "api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"
    ),
    path(
        "api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"
    ),
    path(
        "api/token/blacklist/",
        TokenBlacklistView.as_view(),
        name="token_blacklist",
    ),
    path("api/register/", UserRegistrationView.as_view(), name="register"),
    path("api/profile/", user_profile_view, name="profile"),
    path("api/logout/", logout_view, name="logout"),
]
