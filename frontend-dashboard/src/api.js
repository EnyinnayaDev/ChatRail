import { API_BASE, REALTIME_BASE } from "./config.js";

async function j(res) {
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} — ${detail}`);
  }
  return res.json();
}

export const api = {
  listOrders: (merchantId, status) => {
    const qs = new URLSearchParams({ merchant_id: merchantId });
    if (status) qs.set("status", status);
    return fetch(`${API_BASE}/api/orders/?${qs}`).then(j);
  },
  getOrder: (id) => fetch(`${API_BASE}/api/orders/${id}/`).then(j),
  approve: (id, total_amount) =>
    fetch(`${API_BASE}/api/orders/${id}/approve/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total_amount }),
    }).then(j),
  paymentLink: (id) =>
    fetch(`${API_BASE}/api/orders/${id}/payment-link/`, { method: "POST" }).then(j),
  assignRider: (id, rider) =>
    fetch(`${REALTIME_BASE}/api/orders/${id}/assign-rider`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rider }),
    }).then(j),
  deliver: (id) =>
    fetch(`${REALTIME_BASE}/api/orders/${id}/deliver`, { method: "PATCH" }).then(j),
};
