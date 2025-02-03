from rest_framework import viewsets, permissions
from .models import Room, Message
from .serializers import RoomSerializer, MessageSerializer


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


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
