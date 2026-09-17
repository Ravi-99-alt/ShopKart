from django.urls import path

from .views import (
    CreateReviewView,
    ProductReviewListView,
    ReviewDetailView,
)


urlpatterns = [
    path(
        "",
        CreateReviewView.as_view(),
        name="review-create",
    ),
    path(
        "product/<int:product_id>/",
        ProductReviewListView.as_view(),
        name="product-review-list",
    ),
    path(
        "<int:pk>/",
        ReviewDetailView.as_view(),
        name="review-detail",
    ),
]