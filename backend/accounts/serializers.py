from rest_framework import serializers
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "phone",
        ]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "profile_image",
        ]

        read_only_fields = [
            "id",
            "username",
        ]


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "profile_image",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
        ]

        read_only_fields = [
            "id",
            "username",
            "date_joined",
        ]