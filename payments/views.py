from django.db import transaction

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework.response import Response

from orders.models import Order

from .models import Payment
from .serializers import PaymentSerializer


class IsAdminUser(BasePermission):
    """
    Allows access only to authenticated staff/admin users.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class CreatePaymentView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        order_id = request.data.get("order")
        payment_method = request.data.get("payment_method")

        if not order_id:
            return Response(
                {"detail": "Order ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not payment_method:
            return Response(
                {"detail": "Payment method is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid_methods = dict(
            Payment.METHOD_CHOICES
        )

        if payment_method not in valid_methods:
            return Response(
                {
                    "detail": (
                        "Invalid payment method. "
                        "Choose one of: "
                        f"{', '.join(valid_methods.keys())}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = Order.objects.get(
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
                        "Payment cannot be created "
                        "for a cancelled order."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.status in ["shipped", "delivered"]:
            return Response(
                {
                    "detail": (
                        "Payment cannot be created "
                        f"for an order that is already "
                        f"{order.status}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if hasattr(order, "payment"):
            return Response(
                {
                    "detail": (
                        "A payment already exists "
                        "for this order."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        transaction_id = (
            f"TXN-{Payment.objects.count() + 1}-"
            f"{order.id}"
        )

        payment = Payment.objects.create(
            user=request.user,
            order=order,
            amount=order.total,
            payment_method=payment_method,
            status="pending",
            transaction_id=transaction_id,
        )

        return Response(
            PaymentSerializer(payment).data,
            status=status.HTTP_201_CREATED,
        )


class PaymentListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return (
            Payment.objects
            .filter(user=self.request.user)
            .select_related("order")
            .order_by("-created_at")
        )


class PaymentDetailView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PaymentSerializer

    def get_queryset(self):
        return (
            Payment.objects
            .filter(user=self.request.user)
            .select_related("order")
        )


class PaymentStatusView(generics.UpdateAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = PaymentSerializer

    @transaction.atomic
    def patch(self, request, pk, *args, **kwargs):
        try:
            payment = (
                Payment.objects
                .select_related("order")
                .get(id=pk)
            )
        except Payment.DoesNotExist:
            return Response(
                {"detail": "Payment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        new_status = request.data.get("status")

        if new_status not in ["paid", "failed"]:
            return Response(
                {
                    "detail": (
                        "Status must be either "
                        "'paid' or 'failed'."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if payment.status != "pending":
            return Response(
                {
                    "detail": (
                        "Only pending payments "
                        "can be updated."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment.status = new_status
        payment.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        if new_status == "paid":
            order = payment.order

            if order.status == "pending":
                order.status = "confirmed"
                order.save(
                    update_fields=[
                        "status",
                        "updated_at",
                    ]
                )

        return Response(
            PaymentSerializer(payment).data,
            status=status.HTTP_200_OK,
        )