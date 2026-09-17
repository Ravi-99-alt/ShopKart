from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import Coupon
from .serializers import CouponSerializer


class CouponListCreateView(generics.ListCreateAPIView):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminUser()]

        return [IsAuthenticated()]


class CouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer

    def get_permissions(self):
        if self.request.method in [
            "PUT",
            "PATCH",
            "DELETE",
        ]:
            return [IsAdminUser()]

        return [IsAuthenticated()]


class ValidateCouponView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        code = request.data.get("code")
        order_amount = request.data.get("order_amount")

        if not code:
            return Response(
                {"detail": "Coupon code is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order_amount is None:
            return Response(
                {"detail": "Order amount is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order_amount = float(order_amount)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Order amount must be a valid number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order_amount <= 0:
            return Response(
                {"detail": "Order amount must be greater than 0."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            coupon = Coupon.objects.get(
                code=code.strip().upper()
            )
        except Coupon.DoesNotExist:
            return Response(
                {"detail": "Invalid coupon code."},
                status=status.HTTP_404_NOT_FOUND,
            )

        now = timezone.now()

        if not coupon.is_active:
            return Response(
                {"detail": "This coupon is inactive."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if now < coupon.valid_from:
            return Response(
                {"detail": "This coupon is not active yet."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if now > coupon.valid_until:
            return Response(
                {"detail": "This coupon has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            coupon.usage_limit is not None
            and coupon.used_count >= coupon.usage_limit
        ):
            return Response(
                {"detail": "This coupon usage limit has been reached."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order_amount < float(coupon.minimum_order_amount):
            return Response(
                {
                    "detail": (
                        f"Minimum order amount is "
                        f"₹{coupon.minimum_order_amount}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if coupon.discount_type == Coupon.DISCOUNT_PERCENTAGE:
            discount = (
                order_amount
                * float(coupon.discount_value)
                / 100
            )

            if coupon.maximum_discount_amount is not None:
                discount = min(
                    discount,
                    float(
                        coupon.maximum_discount_amount
                    ),
                )

        else:
            discount = float(coupon.discount_value)

        discount = min(
            discount,
            order_amount,
        )

        final_amount = order_amount - discount

        return Response(
            {
                "code": coupon.code,
                "discount_type": coupon.discount_type,
                "discount_value": str(
                    coupon.discount_value
                ),
                "order_amount": round(
                    order_amount,
                    2,
                ),
                "discount_amount": round(
                    discount,
                    2,
                ),
                "final_amount": round(
                    final_amount,
                    2,
                ),
            },
            status=status.HTTP_200_OK,
        )