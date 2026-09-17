from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView

from .views import (
    RegisterView,
    ProfileView,
    AdminUserListView,
    AdminUserDetailView,
)


urlpatterns = [
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),
    path(
        "login/",
        TokenObtainPairView.as_view(),
        name="login",
    ),
    path(
        "profile/",
        ProfileView.as_view(),
        name="profile",
    ),
    path(
        "admin/users/",
        AdminUserListView.as_view(),
        name="admin-user-list",
    ),

    path(
        "admin/users/<int:pk>/",
        AdminUserDetailView.as_view(),
        name="admin-user-detail",
    ),
]