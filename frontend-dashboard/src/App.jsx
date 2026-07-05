import { useEffect, useMemo, useState } from "react";
import { COLUMNS, DEMO_MERCHANT_ID } from "./config.js";
import { useLiveOrders } from "./useLiveOrders.js";
import OrderDetail from "./OrderDetail.jsx";
import "./app.css";

function itemsSummary(items = []) {
  if (!items.length) return "—";
  return items.map((i) => `${i.qty}× ${i.item}`).join(", ");
}

const AUTH_KEY = "chatrail.merchant-auth";

function getSavedAuth() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [auth, setAuth] = useState(() => getSavedAuth());
  const [mode, setMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
  });
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    if (!auth || typeof window === "undefined") return;
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  }, [auth]);

  const handleLogout = () => {
    setAuth(null);
    setAuthForm({ name: "", email: "", password: "", company: "" });
    setMode("login");
    setAuthError("");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_KEY);
    }
  };

  if (!auth) {
    return (
      <DashboardAuth
        mode={mode}
        setMode={setMode}
        form={authForm}
        setForm={setAuthForm}
        error={authError}
        busy={authBusy}
        onSubmit={(e) => {
          e.preventDefault();
          setAuthError("");
          setAuthBusy(true);

          try {
            const email = authForm.email.trim().toLowerCase();
            const password = authForm.password.trim();
            if (!email || !password) throw new Error("Email and password are required.");

            if (mode === "register") {
              if (!authForm.name.trim()) throw new Error("Name is required.");
              if (password.length < 6) throw new Error("Password must be at least 6 characters.");
            }

            setAuth({
              name: authForm.name.trim() || email.split("@")[0],
              email,
              company: authForm.company.trim() || "SwiftOrder Merchant",
            });
          } catch (err) {
            setAuthError(err.message);
          } finally {
            setAuthBusy(false);
          }
        }}
      />
    );
  }

  return <DashboardWorkspace auth={auth} onLogout={handleLogout} />;
}

function DashboardWorkspace({ auth, onLogout }) {
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
          <div className="topbar-sub">Signed in as {auth.name || auth.email} · {auth.company}</div>
        </div>
        <div className="topbar-actions">
          <div className="status-pill" data-kind={status}>
            {status === "loading" && "Loading…"}
            {status === "ready"   && "● Live"}
            {status === "mock"    && "● Mock data (backend offline)"}
            {status === "error"   && "● Error"}
          </div>
          <button className="auth-logout" type="button" onClick={onLogout}>Sign out</button>
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

function DashboardAuth({ mode, setMode, form, setForm, error, busy, onSubmit }) {
  const isRegister = mode === "register";

  return (
    <div className="dashboard-auth-shell">
      <div className="dashboard-auth-card">
        <div className="dashboard-auth-badge">Merchant Portal</div>
        <h1>{isRegister ? "Create merchant account" : "Merchant sign in"}</h1>
        <p>
          Access the merchant dashboard to review chats, approve orders, generate payment links, and track delivery.
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Merchant authentication mode">
          <button
            type="button"
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "auth-tab active" : "auth-tab"}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          {isRegister && (
            <label>
              Full name
              <input
                className="auth-input"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Ada Nwosu"
                autoComplete="name"
              />
            </label>
          )}

          <label>
            Email address
            <input
              className="auth-input"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="ada@merchant.com"
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              className="auth-input"
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="••••••••"
              autoComplete={isRegister ? "new-password" : "current-password"}
            />
          </label>

          {isRegister && (
            <label>
              Store name
              <input
                className="auth-input"
                value={form.company}
                onChange={(e) => setForm((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="Ada Fashion House"
                autoComplete="organization"
              />
            </label>
          )}

          {error && <div className="auth-error">{error}</div>}

          <button className="auth-submit" type="submit" disabled={busy}>
            {busy ? "Working…" : isRegister ? "Create account" : "Login"}
          </button>
        </form>

        <div className="auth-foot">
          Demo access only. This gate is front-end only for the prototype, and your session stays in this browser.
        </div>
      </div>
    </div>
  );
}
