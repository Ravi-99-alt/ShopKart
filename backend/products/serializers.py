from django.core.validators import URLValidator
from rest_framework import serializers

from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.name",
        read_only=True,
    )

    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product

        fields = [
            "id",
            "category",
            "category_name",
            "name",
            "slug",
            "description",
            "price",
            "discount_price",
            "stock",
            "image",
            "is_active",
            "average_rating",
            "review_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "category_name",
            "average_rating",
            "review_count",
            "created_at",
            "updated_at",
        ]

    def validate_image(self, value):
        if value:
            validator = URLValidator()

            try:
                validator(value)
            except Exception:
                raise serializers.ValidationError(
                    "Please enter a valid image URL."
                )

        return value

    def validate(self, attrs):
        price = attrs.get("price")
        discount_price = attrs.get("discount_price")

        if self.instance:
            if price is None:
                price = self.instance.price

            if "discount_price" not in attrs:
                discount_price = self.instance.discount_price

        if (
            price is not None
            and discount_price is not None
            and discount_price > price
        ):
            raise serializers.ValidationError(
                {
                    "discount_price": (
                        "Discount price cannot be greater than "
                        "the original price."
                    )
                }
            )

        return attrs

    def get_average_rating(self, obj):
        from django.db.models import Avg
        from reviews.models import Review

        result = Review.objects.filter(
            product=obj
        ).aggregate(
            average=Avg("rating")
        )

        average = result["average"]

        if average is None:
            return 0

        return round(float(average), 1)

    def get_review_count(self, obj):
        from reviews.models import Review

        return Review.objects.filter(
            product=obj
        ).count()