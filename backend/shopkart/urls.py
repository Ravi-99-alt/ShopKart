from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/accounts/", include("accounts.urls")),
    path("api/categories/", include("categories.urls")),
    path("api/products/", include("products.urls")),
    path("api/cart/", include("cart.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/reviews/", include("reviews.urls")),
    path("api/wishlist/", include("wishlist.urls")),
    path("api/coupons/", include("coupons.urls")),
    path("api/payments/", include("payments.urls")),
]
