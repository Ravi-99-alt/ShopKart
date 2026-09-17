from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from orders.models import Order
from products.models import Product

from .models import Review
from .serializers import ReviewSerializer


class CreateReviewView(generics.CreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        product_id = request.data.get("product")
        order_id = request.data.get("order")
        rating = request.data.get("rating")
        comment = request.data.get("comment", "")

        if not product_id:
            return Response(
                {"detail": "Product ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not order_id:
            return Response(
                {"detail": "Order ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if rating is None:
            return Response(
                {"detail": "Rating is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            rating = int(rating)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Rating must be a number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if rating < 1 or rating > 5:
            return Response(
                {"detail": "Rating must be between 1 and 5."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product = get_object_or_404(
            Product,
            id=product_id,
        )

        try:
            order = Order.objects.prefetch_related(
                "items"
            ).get(
                id=order_id,
                user=request.user,
            )
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.status == "cancelled":
            return Response(
                {
                    "detail": (
                        "You cannot review a cancelled order."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
    )

        purchased = order.items.filter(
            product=product
        ).exists()

        if not purchased:
            return Response(
                {
                    "detail": (
                        "You can only review products "
                        "from this order."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if Review.objects.filter(
            user=request.user,
            product=product,
            order=order,
        ).exists():
            return Response(
                {
                    "detail": (
                        "You have already reviewed "
                        "this product for this order."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        review = Review.objects.create(
            user=request.user,
            product=product,
            order=order,
            rating=rating,
            comment=comment,
        )

        return Response(
            ReviewSerializer(review).data,
            status=status.HTTP_201_CREATED,
        )


class ProductReviewListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        product_id = self.kwargs["product_id"]

        return (
            Review.objects
            .filter(product_id=product_id)
            .select_related(
                "user",
                "product",
            )
        )


class ReviewDetailView(generics.RetrieveAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Review.objects.select_related(
            "user",
            "product",
        )