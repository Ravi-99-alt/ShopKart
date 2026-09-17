from django.shortcuts import get_object_or_404

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from products.models import Product

from .models import WishlistItem
from .serializers import WishlistItemSerializer


class WishlistListView(generics.ListAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            WishlistItem.objects
            .filter(user=self.request.user)
            .select_related("product")
        )


class AddToWishlistView(generics.CreateAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        product_id = request.data.get("product")

        if not product_id:
            return Response(
                {"detail": "Product ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product = get_object_or_404(
            Product,
            id=product_id,
            is_active=True,
        )

        wishlist_item, created = WishlistItem.objects.get_or_create(
            user=request.user,
            product=product,
        )

        if not created:
            return Response(
                {
                    "detail": (
                        "Product is already in your wishlist."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            WishlistItemSerializer(wishlist_item).data,
            status=status.HTTP_201_CREATED,
        )


class RemoveFromWishlistView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(
            user=self.request.user
        )

    def destroy(self, request, *args, **kwargs):
        wishlist_item = get_object_or_404(
            self.get_queryset(),
            product_id=kwargs["product_id"],
        )

        wishlist_item.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT,
        )