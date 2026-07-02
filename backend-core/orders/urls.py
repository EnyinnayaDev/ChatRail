from django.urls import path
from . import views

urlpatterns = [
    path("merchants/",                 views.merchant_create,     name="merchant-create"),
    path("merchants/<uuid:merchant_id>/", views.merchant_detail,  name="merchant-detail"),

    path("orders/",                    views.order_list_create,   name="order-list-create"),
    path("orders/<uuid:order_id>/",    views.order_detail,        name="order-detail"),
    path("orders/<uuid:order_id>/approve/",       views.order_approve,       name="order-approve"),
    path("orders/<uuid:order_id>/payment-link/",  views.order_payment_link,  name="order-payment-link"),
]
