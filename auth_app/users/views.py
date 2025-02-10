from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import UserRegistrationSerializer, UserProfileSerializer
from .models import UserProfile, BlacklistedToken

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# ...existing code...
class UserRegistrationView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            return Response(
                {
                    "accessToken": access_token,
                    "refreshToken": refresh_token,
                },
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    try:
        profile = UserProfile.objects.get(user=request.user)
        if request.method == "GET":
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        elif request.method == "PUT":
            serializer = UserProfileSerializer(profile, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({"message": "Profile updated successfully"})
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "Profile not found."},
            status=status.HTTP_404_NOT_FOUND,
        )


@api_view(["POST"])
def logout_view(request):
    try:
        refresh_token = request.data.get("refreshToken")
        if not refresh_token:
            return Response(
                {"error": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        token = RefreshToken(refresh_token)
        token.blacklist()

        BlacklistedToken.objects.create(token=refresh_token)

        return Response(
            {"message": "Logout successful"}, status=status.HTTP_200_OK
        )
    except TokenError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
