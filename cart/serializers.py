from rest_framework import serializers

from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    price = serializers.SerializerMethodField()
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = [
            "id",
            "product",
            "product_name",
            "price",
            "quantity",
            "subtotal",
        ]

    def get_price(self, obj):
        if obj.product.discount_price is not None:
            return obj.product.discount_price

        return obj.product.price

    def get_subtotal(self, obj):
        if obj.product.discount_price is not None:
            price = obj.product.discount_price
        else:
            price = obj.product.price

        return price * obj.quantity


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(
        many=True,
        read_only=True,
    )

    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "items",
            "total",
            "created_at",
            "updated_at",
        ]

    def get_total(self, obj):
        total = 0

        for item in obj.items.select_related("product").all():
            if item.product.discount_price is not None:
                price = item.product.discount_price
            else:
                price = item.product.price

            total += price * item.quantity

        return total