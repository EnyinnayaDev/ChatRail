import uuid
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Merchant",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=120)),
                ("phone", models.CharField(max_length=32, unique=True)),
                ("business_type", models.CharField(blank=True, max_length=80, null=True)),
                ("opay_account", models.CharField(blank=True, max_length=64, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"db_table": "merchants"},
        ),
        migrations.CreateModel(
            name="Order",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("customer_handle", models.CharField(blank=True, max_length=120, null=True)),
                ("items", models.JSONField()),
                ("delivery_address", models.TextField(blank=True, null=True)),
                ("delivery_type", models.CharField(blank=True, max_length=32, null=True)),
                ("total_amount", models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ("status", models.CharField(
                    choices=[("pending_approval","pending_approval"),("awaiting_payment","awaiting_payment"),
                             ("paid","paid"),("out_for_delivery","out_for_delivery"),
                             ("delivered","delivered"),("cancelled","cancelled")],
                    default="pending_approval", max_length=32)),
                ("opay_tx_reference", models.CharField(blank=True, max_length=64, null=True, unique=True)),
                ("payment_link", models.TextField(blank=True, null=True)),
                ("ai_confidence", models.CharField(blank=True, max_length=16, null=True)),
                ("raw_message", models.TextField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("merchant", models.ForeignKey(
                    db_column="merchant_id",
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="orders",
                    to="orders.merchant")),
            ],
            options={"db_table": "orders"},
        ),
        migrations.CreateModel(
            name="OrderEvent",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("event_type", models.CharField(max_length=48)),
                ("payload", models.JSONField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("order", models.ForeignKey(
                    db_column="order_id",
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="events",
                    to="orders.order")),
            ],
            options={"db_table": "order_events"},
        ),
        migrations.AddIndex(
            model_name="order",
            index=models.Index(fields=["merchant", "status"], name="idx_orders_merch_status"),
        ),
        migrations.AddIndex(
            model_name="orderevent",
            index=models.Index(fields=["order", "created_at"], name="idx_order_events_order"),
        ),
    ]
