from django.urls import path
from . import views

urlpatterns = [
    path("dashboard/", views.matrix_dashboard, name="matrix_dashboard"),
]
