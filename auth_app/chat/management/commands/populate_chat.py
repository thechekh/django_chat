from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

from chat.models import Room, Message

User = get_user_model()


class Command(BaseCommand):
    help = "Populates the database with rooms and messages."

    def handle(self, *args, **options):
        self.stdout.write("Starting chat population...")

        # Use the first existing user as the room creator.
        users = list(User.objects.all())
        if not users:
            self.stdout.write(
                "No users found. Run 'python manage.py populate_users' first."
            )
            return

        creator = users[0]

        # Create 4 rooms
        room_names = [f"room_{i}" for i in range(1, 5)]
        rooms = []
        for name in room_names:
            room, created = Room.objects.get_or_create(
                name=name, defaults={"created_by": creator, "users_amount": 0}
            )
            rooms.append(room)
        self.stdout.write(f"Created {len(rooms)} rooms.")

        # Create messages for each user.
        # Time deltas: today, yesterday, 4 days ago, and 7 days ago.
        time_deltas = [
            timedelta(days=0),
            timedelta(days=1),
            timedelta(days=4),
            timedelta(days=7),
        ]
        for user in users:
            for idx, delta in enumerate(time_deltas):
                room = rooms[idx % len(rooms)]
                message = Message.objects.create(
                    room=room,
                    user=user,
                    content=f"Message {idx+1} from {user.username}",
                )
                # Update timestamp to simulate past messages.
                custom_time = timezone.now() - delta
                Message.objects.filter(pk=message.pk).update(
                    timestamp=custom_time
                )
                self.stdout.write(
                    f"Created message for {user.username} in {room.name} at {custom_time}"
                )

        self.stdout.write("Chat population complete.")
