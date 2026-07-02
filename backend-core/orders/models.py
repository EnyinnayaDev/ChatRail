"""
Models mirror database/schema.sql exactly.
Do not add fields that aren't in the SQL schema.
"""
import uuid
from django.db import models


class Merchant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=32, unique=True)
    business_type = models.CharField(max_length=80, null=True, blank=True)
    opay_account = models.CharField(max_length=64, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "merchants"

    def __str__(self):
        return f"{self.name} ({self.phone})"


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending_approval", "pending_approval"),
        ("awaiting_payment", "awaiting_payment"),
        ("paid", "paid"),
        ("out_for_delivery", "out_for_delivery"),
        ("delivered", "delivered"),
        ("cancelled", "cancelled"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    merchant = models.ForeignKey(
        Merchant, on_delete=models.CASCADE, related_name="orders",
        db_column="merchant_id",
    )
    customer_handle = models.CharField(max_length=120, null=True, blank=True)
    items = models.JSONField()
    delivery_address = models.TextField(null=True, blank=True)
    delivery_type = models.CharField(max_length=32, null=True, blank=True)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="pending_approval")
    opay_tx_reference = models.CharField(max_length=64, unique=True, null=True, blank=True)
    payment_link = models.TextField(null=True, blank=True)
    ai_confidence = models.CharField(max_length=16, null=True, blank=True)
    raw_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "orders"
        indexes = [models.Index(fields=["merchant", "status"])]


class OrderEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name="events",
        db_column="order_id",
    )
    event_type = models.CharField(max_length=48)
    payload = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "order_events"
        indexes = [models.Index(fields=["order", "created_at"])]
