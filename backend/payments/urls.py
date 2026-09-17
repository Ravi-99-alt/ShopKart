from django.urls import path

from .views import (
    CreatePaymentView,
    PaymentListView,
    PaymentDetailView,
    PaymentStatusView,
)

urlpatterns = [
    path(
        "",
        CreatePaymentView.as_view(),
        name="payment-create",
    ),
    path(
        "list/",
        PaymentListView.as_view(),
        name="payment-list",
    ),
    path(
        "<int:pk>/",
        PaymentDetailView.as_view(),
        name="payment-detail",
    ),
    path(
        "<int:pk>/status/",
        PaymentStatusView.as_view(),
        name="payment-status",
    ),
]