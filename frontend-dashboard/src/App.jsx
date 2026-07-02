import { useMemo, useState } from "react";
import { COLUMNS, DEMO_MERCHANT_ID } from "./config.js";
import { useLiveOrders } from "./useLiveOrders.js";
import OrderDetail from "./OrderDetail.jsx";
import "./app.css";

function itemsSummary(items = []) {
  if (!items.length) return "—";
  return items.map((i) => `${i.qty}× ${i.item}`).join(", ");
}

export default function App() {
  const { orders, status, error, setOrders } = useLiveOrders(DEMO_MERCHANT_ID);
  const [selectedId, setSelectedId] = useState(null);

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(COLUMNS.map((c) => [c.key, []]));
    orders.forEach((o) => { if (map[o.status]) map[o.status].push(o); });
    return map;
  }, [orders]);

  const selected = orders.find((o) => o.id === selectedId) || null;

  const localUpdate = (patch) => {
    setOrders((prev) => prev.map((o) => (o.id === patch.id ? { ...o, ...patch } : o)));
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <div className="logo">
            <span className="logo-badge">O</span> SwiftOrder <span className="muted">— Merchant Dashboard</span>
          </div>
        </div>
        <div className="status-pill" data-kind={status}>
          {status === "loading" && "Loading…"}
          {status === "ready"   && "● Live"}
          {status === "mock"    && "● Mock data (backend offline)"}
          {status === "error"   && "● Error"}
        </div>
      </header>

      {status === "loading" ? (
        <div className="empty">Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="empty">
          <h3>No orders yet.</h3>
          <p>Send a message via the chat sandbox to create one.</p>
        </div>
      ) : (
        <main className="board">
          {COLUMNS.map((col) => (
            <section className="col" key={col.key}>
              <header className="col-head">
                <span>{col.label}</span>
                <span className="count">{byStatus[col.key].length}</span>
              </header>
              <div className="col-body">
                {byStatus[col.key].length === 0 && (
                  <div className="empty-col">No orders here.</div>
                )}
                {byStatus[col.key].map((o) => (
                  <article
                    key={o.id}
                    className={"card" + (o.id === selectedId ? " selected" : "")}
                    onClick={() => setSelectedId(o.id)}
                  >
                    <div className="card-head">
                      <span className="mono">{o.id.slice(0, 8)}…</span>
                      {o.ai_confidence && (
                        <span className={`chip conf-${o.ai_confidence}`}>{o.ai_confidence}</span>
                      )}
                    </div>
                    <div className="card-body">{itemsSummary(o.items)}</div>
                    <div className="card-foot">
                      {o.total_amount
                        ? <b>₦{Number(o.total_amount).toLocaleString()}</b>
                        : <span className="muted">unpriced</span>}
                      <span className="muted small">{o.delivery_type || ""}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </main>
      )}

      {selected && (
        <OrderDetail
          order={selected}
          onClose={() => setSelectedId(null)}
          onLocalUpdate={localUpdate}
        />
      )}

      {status === "mock" && (
        <footer className="footer-note">
          Showing mock data. Start <code>backend-core</code> on :8000 and <code>backend-realtime</code> on :4000 to go live.
          {error && <span className="muted small"> ({error})</span>}
        </footer>
      )}
    </div>
  );
}
