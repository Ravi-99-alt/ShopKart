from django.urls import path

from .views import (
    CreateOrderView,
    OrderListView,
    OrderDetailView,
    CancelOrderView,
    AdminOrderStatusView,
    AdminOrderListView,
    AdminOrderDetailView,
    AdminOrderSummaryView,

)


urlpatterns = [
    path(
        "",
        CreateOrderView.as_view(),
        name="order-create",
    ),
    path(
        "list/",
        OrderListView.as_view(),
        name="order-list",
    ),

    path(
        "admin/",
        AdminOrderListView.as_view(),
        name="admin-order-list",
    ),

    path(
        "admin/summary/",
        AdminOrderSummaryView.as_view(),
        name="admin-order-summary",
 ),



    path(
        "admin/<int:pk>/",
        AdminOrderDetailView.as_view(),
        name="admin-order-detail",
    ),


    path(
        "<int:pk>/",
        OrderDetailView.as_view(),
        name="order-detail",
    ),

    path(
        "<int:pk>/cancel/",
        CancelOrderView.as_view(),
        name="order-cancel",
    ),
    path(
        "<int:pk>/status/",
        AdminOrderStatusView.as_view(),
        name="admin-order-status",
    ),
]