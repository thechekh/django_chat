# Generated by Django 5.0 on 2025-02-05 15:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0007_blacklistedtoken"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="user",
            name="first_name",
        ),
        migrations.RemoveField(
            model_name="user",
            name="last_name",
        ),
    ]
