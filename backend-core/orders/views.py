from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Merchant, Order, OrderEvent
from .serializers import (
    MerchantSerializer,
    OrderSerializer,
    OrderDetailSerializer,
    OrderCreateSerializer,
    ApproveSerializer,
)
from . import opay


# ---------- merchants ----------

@api_view(["POST"])
def merchant_create(request):
    ser = MerchantSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    merchant = ser.save()
    return Response(MerchantSerializer(merchant).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def merchant_detail(request, merchant_id):
    merchant = get_object_or_404(Merchant, id=merchant_id)
    return Response(MerchantSerializer(merchant).data)


# ---------- orders ----------

@api_view(["GET", "POST"])
def order_list_create(request):
    if request.method == "GET":
        qs = Order.objects.all().order_by("-created_at")
        merchant_id = request.query_params.get("merchant_id")
        status_filter = request.query_params.get("status")
        if merchant_id:
            qs = qs.filter(merchant_id=merchant_id)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return Response(OrderSerializer(qs, many=True).data)

    # POST — create draft order
    ser = OrderCreateSerializer(data=request.data)
    ser.is_valid(raise_exception=True)
    data = ser.validated_data
    merchant = get_object_or_404(Merchant, id=data["merchant_id"])

    with transaction.atomic():
        order = Order.objects.create(
            merchant=merchant,
            customer_handle=data.get("customer_handle") or None,
            items=data["items"],
            delivery_address=data.get("delivery_address") or None,
            delivery_type=data.get("delivery_type") or None,
            raw_message=data.get("raw_message") or None,
            ai_confidence=data.get("ai_confidence") or None,
            status="pending_approval",
        )
        OrderEvent.objects.create(
            order=order,
            event_type="created",
            payload={"source": "api"},
        )
    return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id)
    return Response(OrderDetailSerializer(order).data)


@api_view(["PATCH"])
def order_approve(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    if order.status != "pending_approval":
        return Response(
            {"detail": f"Order in status '{order.status}' cannot be approved."},
            status=status.HTTP_409_CONFLICT,
        )

    ser = ApproveSerializer(data=request.data)
    ser.is_valid(raise_exception=True)

    with transaction.atomic():
        order.total_amount = ser.validated_data["total_amount"]
        order.status = "awaiting_payment"
        order.save(update_fields=["total_amount", "status", "updated_at"])
        OrderEvent.objects.create(
            order=order,
            event_type="approved",
            payload={"total_amount": str(order.total_amount)},
        )
    return Response(OrderDetailSerializer(order).data)


@api_view(["POST"])
def order_payment_link(request, order_id):
    order = get_object_or_404(Order, id=order_id)

    if order.status != "awaiting_payment":
        return Response(
            {"detail": "Order must be in 'awaiting_payment' before generating a payment link."},
            status=status.HTTP_409_CONFLICT,
        )
    if order.total_amount is None:
        return Response(
            {"detail": "Order has no total_amount — approve it first."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    link, reference = opay.generate_payment_link(str(order.id), order.total_amount)

    with transaction.atomic():
        order.payment_link = link
        order.opay_tx_reference = reference
        order.save(update_fields=["payment_link", "opay_tx_reference", "updated_at"])
        OrderEvent.objects.create(
            order=order,
            event_type="payment_link_generated",
            payload={"opay_tx_reference": reference, "payment_link": link},
        )
    return Response({
        "order_id": str(order.id),
        "payment_link": link,
        "opay_tx_reference": reference,
        "amount": str(order.total_amount),
    })
