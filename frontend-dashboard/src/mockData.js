// Shape mirrors database/seed.sql — for offline UI development.
import { DEMO_MERCHANT_ID } from "./config.js";

export const MOCK_ORDERS = [
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
    merchant_id: DEMO_MERCHANT_ID,
    customer_handle: "+2348111111111",
    items: [{ item: "Black tracksuit", qty: 2, size: "M", color: "black" }],
    delivery_address: "FUTO front gate",
    delivery_type: "rider",
    total_amount: null,
    status: "pending_approval",
    raw_message: "Abeg send two medium black tracksuits to FUTO front gate",
    ai_confidence: "high",
  },
  {
    id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
    merchant_id: DEMO_MERCHANT_ID,
    customer_handle: "+2348222222222",
    items: [{ item: "Red gown", qty: 1, size: "L" }],
    delivery_address: "15 Allen Avenue, Ikeja",
    delivery_type: "rider",
    total_amount: "15000.00",
    status: "awaiting_payment",
    raw_message: "Please send one red gown size L to 15 Allen Avenue Ikeja",
    ai_confidence: "high",
  },
];
