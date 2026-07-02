-- Seed data for local dev + frontend mocks.
-- IDs are fixed so both frontends can hardcode a demo merchant_id.

INSERT INTO merchants (id, name, phone, business_type, opay_account) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Ada Fashion House',   '+2348012345678', 'apparel',  '8012345678'),
  ('22222222-2222-2222-2222-222222222222', 'Chike Jollof Kitchen','+2348098765432', 'food',     '8098765432')
ON CONFLICT (id) DO NOTHING;

INSERT INTO orders (id, merchant_id, customer_handle, items, delivery_address, delivery_type, total_amount, status, raw_message, ai_confidence) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
   '11111111-1111-1111-1111-111111111111',
   '+2348111111111',
   '[{"item":"Black tracksuit","qty":2,"size":"M","color":"black"}]'::jsonb,
   'FUTO front gate',
   'rider',
   NULL,
   'pending_approval',
   'Abeg send two medium black tracksuits to FUTO front gate',
   'high'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
   '11111111-1111-1111-1111-111111111111',
   '+2348222222222',
   '[{"item":"Red gown","qty":1,"size":"L"}]'::jsonb,
   '15 Allen Avenue, Ikeja',
   'rider',
   15000.00,
   'awaiting_payment',
   'Please send one red gown size L to 15 Allen Avenue Ikeja',
   'high'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
   '22222222-2222-2222-2222-222222222222',
   '+2348333333333',
   '[{"item":"Party jollof pack","qty":5}]'::jsonb,
   'FUTO Hostel B',
   'dispatch',
   12500.00,
   'paid',
   '5 party jollof to hostel B FUTO',
   'high')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_events (order_id, event_type, payload) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'created', '{"source":"seed"}'::jsonb),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'created', '{"source":"seed"}'::jsonb),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'approved', '{"total_amount":15000}'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'created', '{"source":"seed"}'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'approved', '{"total_amount":12500}'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'paid', '{"opay_tx_reference":"SEED-TX-1"}'::jsonb);
