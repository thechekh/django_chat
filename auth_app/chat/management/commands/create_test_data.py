from django.core.management.base import BaseCommand
from chat.services import MatrixAPI


class Command(BaseCommand):
    help = "Create test chat rooms and users"

    def handle(self, *args, **kwargs):
        user1 = "@user1:localhost"
        user2 = "@user2:localhost"
        room_name = "test_room"

        self.stdout.write("Creating a test room...")
        response = MatrixAPI.create_room(name=room_name, user_id=user1)
        self.stdout.write(f"Room created: {response}")
