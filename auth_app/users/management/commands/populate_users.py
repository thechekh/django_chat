from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Populates the database with initial users."

    def handle(self, *args, **options):
        self.stdout.write("Starting user population...")

        user_names = ["Danylo", "John", "James", "Michael", "Mark"]
        users = []
        for uname in user_names:
            email = f"{uname.lower()}@example.com"
            user, created = User.objects.get_or_create(
                username=uname, defaults={"email": email}
            )
            if created:
                user.set_password("password123")
                user.save()
            users.append(user)
        self.stdout.write(f"Created {len(users)} users.")
