from rest_framework import serializers
from .models import Merchant, Order, OrderEvent


class MerchantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Merchant
        fields = ["id", "name", "phone", "business_type", "opay_account", "created_at"]
        read_only_fields = ["id", "created_at"]


class OrderEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderEvent
        fields = ["id", "event_type", "payload", "created_at"]


class OrderSerializer(serializers.ModelSerializer):
    merchant_id = serializers.UUIDField(source="merchant.id", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "merchant_id", "customer_handle", "items",
            "delivery_address", "delivery_type", "total_amount",
            "status", "opay_tx_reference", "payment_link",
            "ai_confidence", "raw_message",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "merchant_id", "status", "opay_tx_reference",
            "payment_link", "created_at", "updated_at",
        ]


class OrderDetailSerializer(OrderSerializer):
    events = OrderEventSerializer(many=True, read_only=True)

    class Meta(OrderSerializer.Meta):
        fields = OrderSerializer.Meta.fields + ["events"]


class OrderCreateSerializer(serializers.Serializer):
    merchant_id = serializers.UUIDField()
    customer_handle = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    items = serializers.ListField(child=serializers.DictField(), allow_empty=False)
    delivery_address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    delivery_type = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    raw_message = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    ai_confidence = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("items must be a non-empty list.")
        for i, entry in enumerate(value):
            if not isinstance(entry, dict):
                raise serializers.ValidationError(f"items[{i}] must be an object.")
            if "item" not in entry or not str(entry.get("item", "")).strip():
                raise serializers.ValidationError(f"items[{i}] missing 'item'.")
            qty = entry.get("qty")
            if qty is None or not isinstance(qty, (int, float)) or qty <= 0:
                raise serializers.ValidationError(f"items[{i}] must have positive numeric 'qty'.")
        return value


class ApproveSerializer(serializers.Serializer):
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0)
