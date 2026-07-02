-- OPay SwiftOrder — database schema
-- Owned by Backend Dev 1 (Python/Django will generate its own migrations from
-- this same shape). Backend Dev 2 (Node.js) connects to this same database
-- directly and must NOT run its own migrations — see /docs for the rule.

CREATE TABLE IF NOT EXISTS merchants (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    opay_merchant_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    merchant_id INT REFERENCES merchants(id),
    customer_phone VARCHAR(20),
    items JSONB NOT NULL,               -- [{item, qty, size, color}]
    delivery_address TEXT,
    delivery_type VARCHAR(20),          -- pickup | rider
    total_amount DECIMAL(10, 2),
    opay_tx_reference VARCHAR(100) UNIQUE,
    status VARCHAR(30) DEFAULT 'pending_approval',
    -- pending_approval, awaiting_payment, paid, out_for_delivery, delivered, cancelled
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_events (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id),
    status VARCHAR(30),
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_merchant_status ON orders (merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON order_events (order_id);
