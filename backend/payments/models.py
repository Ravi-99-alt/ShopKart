from django.conf import settings
from django.db import models

from orders.models import Order


class Payment(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("paid", "Paid"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    ]

    METHOD_CHOICES = [
        ("cod", "Cash on Delivery"),
        ("card", "Card"),
        ("upi", "UPI"),
        ("netbanking", "Net Banking"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments",
    )

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="payment",
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
    )

    payment_method = models.CharField(
        max_length=20,
        choices=METHOD_CHOICES,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    transaction_id = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"Payment #{self.id} - Order #{self.order.id}"