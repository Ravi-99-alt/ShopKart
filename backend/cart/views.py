from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from products.models import Product

from .models import Cart, CartItem
from .serializers import CartSerializer


class CartDetailView(generics.RetrieveAPIView):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        cart, created = Cart.objects.get_or_create(
            user=self.request.user
        )
        return cart


class AddToCartView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        product_id = request.data.get("product")
        quantity = request.data.get("quantity", 1)

        # Check product ID
        if not product_id:
            return Response(
                {"detail": "Product ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check quantity
        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Quantity must be a valid number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity < 1:
            return Response(
                {"detail": "Quantity must be at least 1."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get active product
        try:
            product = Product.objects.get(
                id=product_id,
                is_active=True,
            )
        except Product.DoesNotExist:
            return Response(
                {"detail": "Product not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Check stock
        if quantity > product.stock:
            return Response(
                {
                    "detail": (
                        "Requested quantity exceeds available stock."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get or create user's cart
        cart, created = Cart.objects.get_or_create(
            user=request.user
        )

        # Get or create cart item
        cart_item, item_created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity},
        )

        # If product already exists in cart,
        # increase the quantity
        if not item_created:
            new_quantity = cart_item.quantity + quantity

            if new_quantity > product.stock:
                return Response(
                    {
                        "detail": (
                            "Requested quantity exceeds "
                            "available stock."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            cart_item.quantity = new_quantity
            cart_item.save(
                update_fields=["quantity"]
            )

        return Response(
            CartSerializer(cart).data,
            status=status.HTTP_201_CREATED,
        )


class RemoveCartItemView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(
            cart__user=self.request.user
        )


class UpdateCartItemView(generics.UpdateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(
            cart__user=self.request.user
        )

    def patch(self, request, pk, *args, **kwargs):
        try:
            cart_item = self.get_queryset().select_related(
                "product",
                "cart",
            ).get(pk=pk)

        except CartItem.DoesNotExist:
            return Response(
                {"detail": "Cart item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get quantity
        quantity = request.data.get("quantity")

        if quantity is None:
            return Response(
                {"detail": "Quantity is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate quantity
        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"detail": "Quantity must be a valid number."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity < 1:
            return Response(
                {"detail": "Quantity must be at least 1."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check product stock
        if quantity > cart_item.product.stock:
            return Response(
                {
                    "detail": (
                        "Requested quantity exceeds "
                        "available stock."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update quantity
        cart_item.quantity = quantity
        cart_item.save(
            update_fields=["quantity"]
        )

        return Response(
            CartSerializer(cart_item.cart).data,
            status=status.HTTP_200_OK,
        )