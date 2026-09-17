from django.urls import path

from .views import (
    CartDetailView,
    AddToCartView,
    RemoveCartItemView,
    UpdateCartItemView,
)


urlpatterns = [
    path(
        "",
        CartDetailView.as_view(),
        name="cart-detail",
    ),

    path(
        "add/",
        AddToCartView.as_view(),
        name="cart-add",
    ),

    path(
        "items/<int:pk>/",
        RemoveCartItemView.as_view(),
        name="cart-item-remove",
    ),

    path(
        "items/<int:pk>/update/",
        UpdateCartItemView.as_view(),
        name="cart-item-update",
    ),
]