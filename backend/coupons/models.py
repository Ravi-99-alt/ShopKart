from django.db import models


class Coupon(models.Model):
    DISCOUNT_PERCENTAGE = "percentage"
    DISCOUNT_FIXED = "fixed"

    DISCOUNT_TYPE_CHOICES = [
        (DISCOUNT_PERCENTAGE, "Percentage"),
        (DISCOUNT_FIXED, "Fixed Amount"),
    ]

    code = models.CharField(
        max_length=50,
        unique=True,
    )

    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_TYPE_CHOICES,
    )

    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    minimum_order_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    maximum_discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    valid_from = models.DateTimeField()

    valid_until = models.DateTimeField()

    usage_limit = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    used_count = models.PositiveIntegerField(
        default=0,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.code