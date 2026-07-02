import { useState } from "react";
import { api } from "./api.js";

export default function OrderDetail({ order, onClose, onLocalUpdate }) {
  const [price, setPrice] = useState(order.total_amount || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function guard(fn) {
    setBusy(true); setMsg(null);
    try { await fn(); }
    catch (e) { setMsg({ kind: "err", text: e.message }); }
    finally { setBusy(false); }
  }

  const approve = () => guard(async () => {
    if (!price || Number(price) <= 0) throw new Error("Enter a positive price.");
    const updated = await api.approve(order.id, price);
    onLocalUpdate({ ...order, ...updated, status: "awaiting_payment", total_amount: price });
    // Immediately generate a payment link so the chat can show it.
    try {
      const pl = await api.paymentLink(order.id);
      onLocalUpdate({ ...order, ...updated, status: "awaiting_payment",
                      total_amount: price, payment_link: pl.payment_link,
                      opay_tx_reference: pl.opay_tx_reference });
      setMsg({ kind: "ok", text: `Approved. Payment ref ${pl.opay_tx_reference}` });
    } catch {
      setMsg({ kind: "ok", text: "Approved (payment-link service offline)." });
    }
  });

  const assignRider = () => guard(async () => {
    await api.assignRider(order.id, "Demo Rider");
    onLocalUpdate({ ...order, status: "out_for_delivery" });
    setMsg({ kind: "ok", text: "Rider assigned." });
  });

  const deliver = () => guard(async () => {
    await api.deliver(order.id);
    onLocalUpdate({ ...order, status: "delivered" });
    setMsg({ kind: "ok", text: "Marked delivered." });
  });

  return (
    <aside className="detail">
      <div className="detail-head">
        <div>
          <div className="muted">Order</div>
          <div className="mono">{order.id.slice(0, 8)}…</div>
        </div>
        <button className="ghost" onClick={onClose}>✕</button>
      </div>

      <section>
        <h4>Items</h4>
        <ul className="items">
          {order.items?.map((it, i) => (
            <li key={i}>
              <b>{it.qty}×</b> {it.item}
              {it.size ? <span className="chip">size {it.size}</span> : null}
              {it.color ? <span className="chip">{it.color}</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h4>Delivery</h4>
        <div>{order.delivery_address || <i className="muted">—</i>}</div>
        <div className="muted small">via {order.delivery_type || "—"}</div>
      </section>

      <section>
        <h4>Conversation</h4>
        <div className="chat-quote">
          {order.raw_message || <i className="muted">No transcript captured.</i>}
        </div>
      </section>

      <section>
        <h4>Price</h4>
        {order.status === "pending_approval" ? (
          <div className="row">
            <input
              className="input"
              type="number" min="0" step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter total ₦"
            />
          </div>
        ) : (
          <div className="price">₦{Number(order.total_amount || 0).toLocaleString()}</div>
        )}
        {order.opay_tx_reference ? (
          <div className="muted small">ref {order.opay_tx_reference}</div>
        ) : null}
      </section>

      <section className="actions">
        {order.status === "pending_approval" && (
          <button className="primary" disabled={busy} onClick={approve}>
            {busy ? "Approving…" : "Approve & generate payment link"}
          </button>
        )}
        {order.status === "paid" && (
          <button className="primary" disabled={busy} onClick={assignRider}>
            {busy ? "…" : "Assign rider"}
          </button>
        )}
        {order.status === "out_for_delivery" && (
          <button className="primary" disabled={busy} onClick={deliver}>
            {busy ? "…" : "Mark delivered"}
          </button>
        )}
        {msg && <div className={`banner ${msg.kind}`}>{msg.text}</div>}
      </section>
    </aside>
  );
}
