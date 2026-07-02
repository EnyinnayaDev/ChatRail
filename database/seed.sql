-- Sample data — run after schema.sql. Gives Frontend Dev 1 & 2 realistic
-- data to build against before the real backend endpoints exist.

INSERT INTO merchants (business_name, phone, opay_merchant_id) VALUES
    ('FUTO Fits', '+2348012345678', '256620000001')
ON CONFLICT DO NOTHING;

INSERT INTO orders (merchant_id, customer_phone, items, delivery_address, delivery_type, total_amount, opay_tx_reference, status) VALUES
    (1, '+2348098765432', '[{"item":"Black shirt","qty":2,"size":"M"}]', 'FUTO front gate', 'rider', NULL, NULL, 'pending_approval'),
    (1, '+2348011122233', '[{"item":"Blue jeans","qty":1,"size":"32"}]', 'Owerri, Naze', 'rider', 12000.00, 'TF-1001', 'awaiting_payment'),
    (1, '+2348022233344', '[{"item":"White sneakers","qty":1,"size":"42"}]', 'FUTO hostel B', 'pickup', 18000.00, 'TF-1002', 'paid')
ON CONFLICT DO NOTHING;

INSERT INTO order_events (order_id, status, note) VALUES
    (1, 'pending_approval', 'Order draft created'),
    (2, 'pending_approval', 'Order draft created'),
    (2, 'awaiting_payment', 'Seller approved order'),
    (3, 'pending_approval', 'Order draft created'),
    (3, 'awaiting_payment', 'Seller approved order'),
    (3, 'paid', 'Payment confirmed via OPay webhook');
