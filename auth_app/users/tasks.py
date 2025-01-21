from celery import shared_task

from django.core.mail import send_mail
from django.conf import settings


@shared_task
def send_registration_email(user_email):
    subject = "Registration Email"
    message = "Thank you for registering to our site!"
    send_mail(subject, message, settings.EMAIL_HOST_USER, [user_email])
