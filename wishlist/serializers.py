from rest_framework import serializers

from .models import WishlistItem


class WishlistItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    price = serializers.DecimalField(
        source="product.price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    discount_price = serializers.DecimalField(
        source="product.discount_price",
        max_digits=10,
        decimal_places=2,
        read_only=True,
        allow_null=True,
    )

    stock = serializers.IntegerField(
        source="product.stock",
        read_only=True,
    )

    image = serializers.ImageField(
        source="product.image",
        read_only=True,
    )

    class Meta:
        model = WishlistItem

        fields = [
            "id",
            "product",
            "product_name",
            "price",
            "discount_price",
            "stock",
            "image",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "product_name",
            "price",
            "discount_price",
            "stock",
            "image",
            "created_at",
        ]