export const API_BASE = "http://localhost:8000";        // backend-core
export const REALTIME_BASE = "http://localhost:4000";    // backend-realtime (HTTP)
export const WS_BASE = "ws://localhost:4000";            // backend-realtime (ws)

// Demo merchant from database/seed.sql — "Ada Fashion House"
export const DEMO_MERCHANT_ID = "11111111-1111-1111-1111-111111111111";

export const COLUMNS = [
  { key: "pending_approval", label: "Pending Approval" },
  { key: "awaiting_payment", label: "Awaiting Payment" },
  { key: "paid",             label: "Paid" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered",        label: "Delivered" },
];
