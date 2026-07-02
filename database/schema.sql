-- OPay SwiftOrder — single source of truth
-- Only backend-core runs migrations against this schema.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------- merchants ----------
CREATE TABLE IF NOT EXISTS merchants (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR(120) NOT NULL,
    phone         VARCHAR(32)  NOT NULL UNIQUE,
    business_type VARCHAR(80),
    opay_account  VARCHAR(64),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------- orders ----------
CREATE TABLE IF NOT EXISTS orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id         UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    customer_handle     VARCHAR(120),         -- e.g. WhatsApp number / IG handle
    items               JSONB NOT NULL,        -- [{item, qty, size?, color?, ...}]
    delivery_address    TEXT,
    delivery_type       VARCHAR(32),           -- rider | pickup | dispatch
    total_amount        NUMERIC(12,2),         -- set on approval
    status              VARCHAR(32) NOT NULL DEFAULT 'pending_approval',
                        -- pending_approval | awaiting_payment | paid |
                        -- out_for_delivery | delivered | cancelled
    opay_tx_reference   VARCHAR(64) UNIQUE,
    payment_link        TEXT,
    ai_confidence       VARCHAR(16),
    raw_message         TEXT,                  -- original chat/voice transcript
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_merchant_status
    ON orders(merchant_id, status);

-- ---------- order_events (audit log) ----------
CREATE TABLE IF NOT EXISTS order_events (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    event_type  VARCHAR(48) NOT NULL,   -- created | approved | payment_link_generated |
                                        -- paid | rider_assigned | delivered | cancelled | webhook_received
    payload     JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order
    ON order_events(order_id, created_at);
