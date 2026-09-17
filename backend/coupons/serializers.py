from rest_framework import serializers

from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon

        fields = [
            "id",
            "code",
            "discount_type",
            "discount_value",
            "minimum_order_amount",
            "maximum_discount_amount",
            "is_active",
            "valid_from",
            "valid_until",
            "usage_limit",
            "used_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "used_count",
            "created_at",
            "updated_at",
        ]

    def validate_code(self, value):
        return value.strip().upper()

    def validate_discount_value(self, value):
        if value <= 0:
            raise serializers.ValidationError(
                "Discount value must be greater than 0."
            )

        return value

    def validate(self, attrs):
        discount_type = attrs.get(
            "discount_type",
            getattr(
                self.instance,
                "discount_type",
                None,
            ),
        )

        discount_value = attrs.get(
            "discount_value",
            getattr(
                self.instance,
                "discount_value",
                None,
            ),
        )

        maximum_discount_amount = attrs.get(
            "maximum_discount_amount",
            getattr(
                self.instance,
                "maximum_discount_amount",
                None,
            ),
        )

        if (
            discount_type == Coupon.DISCOUNT_PERCENTAGE
            and discount_value is not None
            and discount_value > 100
        ):
            raise serializers.ValidationError(
                {
                    "discount_value": (
                        "Percentage discount cannot be "
                        "greater than 100."
                    )
                }
            )

        if (
            discount_type == Coupon.DISCOUNT_FIXED
            and maximum_discount_amount is not None
        ):
            raise serializers.ValidationError(
                {
                    "maximum_discount_amount": (
                        "Maximum discount amount is only "
                        "used for percentage coupons."
                    )
                }
            )

        return attrs