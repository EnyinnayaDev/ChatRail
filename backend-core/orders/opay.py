"""
OPay sandbox integration — STUB.

The actual sandbox base URL and auth scheme must be confirmed from the
OPay Business Dashboard (Nigeria). We deliberately do NOT hardcode a
guessed URL as if it were final. When credentials are available, replace
`generate_payment_link` with a real HTTP call.
"""
import uuid
from django.conf import settings


def generate_payment_link(order_id: str, amount) -> tuple[str, str]:
    """
    Returns (payment_link, opay_tx_reference).

    In production this will POST to OPay's sandbox /cashier/create endpoint
    and return the redirect URL from OPay's JSON response.
    """
    reference = f"SWO-{uuid.uuid4().hex[:12].upper()}"
    base = settings.OPAY_SANDBOX_BASE_URL.rstrip("/")
    # Placeholder link shape — will be replaced with the real cashier URL.
    link = f"{base}/cashier/pay?ref={reference}&amount={amount}&order={order_id}"
    return link, reference
