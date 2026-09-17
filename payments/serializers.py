from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    order_total = serializers.DecimalField(
        source="order.total",
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = Payment
        fields = [
            "id",
            "order",
            "order_total",
            "amount",
            "payment_method",
            "status",
            "transaction_id",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "order_total",
            "status",
            "transaction_id",
            "created_at",
            "updated_at",
        ]