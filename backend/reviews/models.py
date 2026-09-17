from django.conf import settings
from django.db import models

from products.models import Product
from orders.models import Order


class Review(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    rating = models.PositiveIntegerField()

    comment = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "product", "order"],
                name="unique_user_product_order_review",
            )
        ]

        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.product.name} - "
            f"{self.rating}/5 - "
            f"{self.user.username}"
        )