export const API_BASE = import.meta.env.VITE_API_BASE;        // backend-core (to create the draft order)
export const REALTIME_BASE = import.meta.env.VITE_REALTIME_BASE;    // backend-realtime (HTTP)
export const WS_BASE = import.meta.env.VITE_WS_BASE;           // backend-realtime (WebSocket)

// Demo merchant from database/seed.sql — "Ada Fashion House"
export const DEMO_MERCHANT_ID = "11111111-1111-1111-1111-111111111111";

export const COLUMNS = [
  { key: "pending_approval", label: "Pending Approval" },
  { key: "awaiting_payment", label: "Awaiting Payment" },
  { key: "paid",             label: "Paid" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered",        label: "Delivered" },
];
