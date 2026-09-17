from rest_framework import filters, generics
from rest_framework.permissions import AllowAny, IsAdminUser

from django_filters.rest_framework import DjangoFilterBackend

from .models import Product
from .serializers import ProductSerializer


class ProductListCreateView(generics.ListCreateAPIView):
    queryset = Product.objects.select_related("category").all()
    serializer_class = ProductSerializer

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = {
        "category": ["exact"],
        "price": ["exact", "gte", "lte"],
        "discount_price": ["exact", "gte", "lte"],
        "stock": ["exact", "gte", "lte"],
        "is_active": ["exact"],
    }

    search_fields = [
        "name",
        "description",
        "category__name",
    ]

    ordering_fields = [
        "price",
        "discount_price",
        "stock",
        "created_at",
        "name",
    ]

    ordering = ["-created_at"]

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminUser()]

        return [AllowAny()]


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related("category").all()
    serializer_class = ProductSerializer

    def get_permissions(self):
        print(
            "PRODUCT DETAIL AUTH USER:",
            self.request.user.username,
            "is_staff:",
            self.request.user.is_staff,
            "is_superuser:",
            self.request.user.is_superuser,
        )

        if self.request.method in ["PUT", "PATCH", "DELETE"]:
            return [IsAdminUser()]

        return [AllowAny()]