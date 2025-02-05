from rest_framework import viewsets, permissions
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Room, Message
from .serializers import RoomSerializer, MessageSerializer


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        room = serializer.save(created_by=self.request.user)
        # Automatically add creator to joined_users.
        room.joined_users.add(self.request.user)

    # This endpoint returns the rooms joined by current user
    @action(detail=False, methods=["get"], url_path="joined")
    def joined_rooms(self, request):
        rooms = Room.objects.filter(joined_users=request.user)
        serializer = self.get_serializer(rooms, many=True)
        return Response(serializer.data)

    # Endpoint to join a room.
    @action(detail=True, methods=["post"], url_path="join")
    def join_room(self, request, pk=None):
        room = self.get_object()
        room.joined_users.add(request.user)
        return Response(
            {"message": "Joined room successfully"}, status=status.HTTP_200_OK
        )

    # Endpoint to leave a room.
    @action(detail=True, methods=["post"], url_path="leave")
    def leave_room(self, request, pk=None):
        room = self.get_object()
        room.joined_users.remove(request.user)
        return Response(
            {"message": "Left room successfully"}, status=status.HTTP_200_OK
        )


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.request.query_params.get("room", None)
        return (
            Message.objects.filter(room_id=room_id)
            if room_id
            else Message.objects.none()
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
