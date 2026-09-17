from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from cart.models import Cart
from coupons.models import Coupon

from .models import Order, OrderItem
from .serializers import OrderSerializer


class CreateOrderView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        try:
            cart = Cart.objects.prefetch_related(
                "items__product"
            ).get(user=request.user)
        except Cart.DoesNotExist:
            return Response(
                {"detail": "Cart not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart_items = list(cart.items.all())

        if not cart_items:
            return Response(
                {"detail": "Your cart is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check products and stock
        for cart_item in cart_items:
            product = cart_item.product

            if not product.is_active:
                return Response(
                    {
                        "detail": (
                            f"{product.name} is no longer available."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if cart_item.quantity > product.stock:
                return Response(
                    {
                        "detail": (
                            f"Insufficient stock for "
                            f"{product.name}. "
                            f"Available stock: {product.stock}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        # Calculate cart subtotal using effective selling price
        subtotal = sum(
            (
                (
                    cart_item.product.discount_price
                    if cart_item.product.discount_price is not None
                    else cart_item.product.price
                )
                * cart_item.quantity
                for cart_item in cart_items
            ),
            Decimal("0.00"),
        )

        # Get coupon code
        coupon_code = request.data.get("coupon_code")

        coupon = None
        discount_amount = Decimal("0.00")

        # Apply coupon
        if coupon_code:
            try:
                coupon = Coupon.objects.select_for_update().get(
                    code=coupon_code.strip().upper()
                )
            except Coupon.DoesNotExist:
                return Response(
                    {"detail": "Invalid coupon code."},
                    status=status.HTTP_400_BAD_REQUEST,
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
                    {
                        "detail": (
                            "This coupon usage limit "
                            "has been reached."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if subtotal < coupon.minimum_order_amount:
                return Response(
                    {
                        "detail": (
                            "Minimum order amount is "
                            f"₹{coupon.minimum_order_amount}."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Calculate discount
            if coupon.discount_type == Coupon.DISCOUNT_PERCENTAGE:
                discount_amount = (
                    subtotal
                    * coupon.discount_value
                    / Decimal("100")
                )

                if coupon.maximum_discount_amount is not None:
                    discount_amount = min(
                        discount_amount,
                        coupon.maximum_discount_amount,
                    )
            else:
                discount_amount = coupon.discount_value

            # Never allow discount greater than subtotal
            discount_amount = min(
                discount_amount,
                subtotal,
            )

        # Final order total
        total = subtotal - discount_amount

        # Create order
        order = Order.objects.create(
            user=request.user,
            status="pending",
            total=total,
            coupon=coupon,
            discount_amount=discount_amount,
        )

        # Create order items and reduce stock
        for cart_item in cart_items:
            product = cart_item.product
            quantity = cart_item.quantity

            # Use discounted price when available
            price = (
                product.discount_price
                if product.discount_price is not None
                else product.price
            )

            item_subtotal = price * quantity

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                price=price,
                quantity=quantity,
                subtotal=item_subtotal,
            )

            product.stock -= quantity
            product.save(
                update_fields=["stock"]
            )

        # Increase coupon usage
        if coupon:
            coupon.used_count += 1
            coupon.save(
                update_fields=[
                    "used_count",
                    "updated_at",
                ]
            )

        # Empty cart
        cart.items.all().delete()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .select_related("coupon")
            .prefetch_related("items")
            .order_by("-created_at")
        )


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .select_related("coupon")
            .prefetch_related("items")
        )


class CancelOrderView(generics.UpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, pk, *args, **kwargs):
        try:
            order = (
                Order.objects
                .select_related("coupon")
                .prefetch_related("items__product")
                .get(
                    id=pk,
                    user=request.user,
                )
            )
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.status == "cancelled":
            return Response(
                {"detail": "Order is already cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.status in ["shipped", "delivered"]:
            return Response(
                {
                    "detail": (
                        "This order cannot be cancelled "
                        "because it has already been "
                        f"{order.status}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Restore product stock
        for order_item in order.items.all():
            product = order_item.product

            product.stock += order_item.quantity
            product.save(
                update_fields=["stock"]
            )

        # Restore coupon usage
        if order.coupon:
            coupon = Coupon.objects.select_for_update().get(
                id=order.coupon.id
            )

            if coupon.used_count > 0:
                coupon.used_count -= 1
                coupon.save(
                    update_fields=[
                        "used_count",
                        "updated_at",
                    ]
                )

        # Cancel order
        order.status = "cancelled"
        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )


class AdminOrderStatusView(APIView):
    permission_classes = [IsAdminUser]

    @transaction.atomic
    def patch(self, request, pk, *args, **kwargs):
        try:
            order = (
                Order.objects
                .select_related("coupon")
                .prefetch_related("items__product")
                .get(id=pk)
            )
        except Order.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        new_status = request.data.get("status")

        valid_statuses = {
            "pending",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled",
        }

        if new_status not in valid_statuses:
            return Response(
                {
                    "detail": (
                        "Invalid status. Choose one of: "
                        "pending, confirmed, shipped, "
                        "delivered, cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if order.status == new_status:
            return Response(
                {
                    "detail": (
                        f"Order is already {new_status}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Allowed order status transitions
        allowed_transitions = {
            "pending": {
                "confirmed",
                "cancelled",
            },
            "confirmed": {
                "shipped",
                "cancelled",
            },
            "shipped": {
                "delivered",
            },
            "delivered": set(),
            "cancelled": set(),
        }

        if new_status not in allowed_transitions[order.status]:
            return Response(
                {
                    "detail": (
                        f"Order cannot be changed from "
                        f"{order.status} to "
                        f"{new_status}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Restore stock if admin cancels order
        if new_status == "cancelled":
            for order_item in order.items.all():
                product = order_item.product

                product.stock += order_item.quantity
                product.save(
                    update_fields=["stock"]
                )

            # Restore coupon usage
            if order.coupon:
                coupon = Coupon.objects.select_for_update().get(
                    id=order.coupon.id
                )

                if coupon.used_count > 0:
                    coupon.used_count -= 1
                    coupon.save(
                        update_fields=[
                            "used_count",
                            "updated_at",
                        ]
                    )

        # Update order status
        order.status = new_status
        order.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )


class AdminOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = (
            Order.objects
            .select_related("user", "coupon")
            .prefetch_related("items")
            .order_by("-created_at")
        )

        order_status = self.request.query_params.get("status")

        if order_status:
            queryset = queryset.filter(
                status=order_status
            )

        return queryset


class AdminOrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return (
            Order.objects
            .select_related("user", "coupon")
            .prefetch_related("items")
        )


class AdminOrderSummaryView(generics.GenericAPIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        total_orders = Order.objects.count()

        pending_orders = Order.objects.filter(
            status="pending"
        ).count()

        confirmed_orders = Order.objects.filter(
            status="confirmed"
        ).count()

        shipped_orders = Order.objects.filter(
            status="shipped"
        ).count()

        delivered_orders = Order.objects.filter(
            status="delivered"
        ).count()

        cancelled_orders = Order.objects.filter(
            status="cancelled"
        ).count()

        total_revenue = (
            Order.objects
            .filter(status="delivered")
            .aggregate(
                total=Sum("total")
            )["total"]
            or Decimal("0.00")
        )

        return Response(
            {
                "total_orders": total_orders,
                "pending_orders": pending_orders,
                "confirmed_orders": confirmed_orders,
                "shipped_orders": shipped_orders,
                "delivered_orders": delivered_orders,
                "cancelled_orders": cancelled_orders,
                "total_revenue": total_revenue,
            },
            status=status.HTTP_200_OK,
        )