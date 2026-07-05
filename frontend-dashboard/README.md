# frontend-dashboard — React (Vite)

Merchant kanban board. **Port 5173.**

The dashboard now includes a lightweight demo login/register gate before the order board. In the current prototype this is front-end only and persists in the browser.

## Stack
- React 18 · Vite 5 · plain HTML/CSS (no Tailwind)

## Run
```bash
npm install
npm run dev
```
Open http://localhost:5173

## Config
Edit `src/config.js` if your backends run on non-default ports.

## Behaviour
- Login/register gate before the dashboard workspace.
- 5 kanban columns: Pending Approval → Awaiting Payment → Paid → Out for Delivery → Delivered.
- Cards show order id, items summary, and total (once approved).
- Clicking a card opens the detail panel with:
  - Full item list, delivery address, conversation placeholder
  - Editable price (for pending orders)
  - Action buttons matching the current status: Approve · Assign Rider · Mark Delivered
- Data source: `GET /api/orders/?merchant_id=&status=` (backend-core).
- Live updates: WebSocket at `/ws?merchant_id=X` (backend-realtime). Cards move columns in real time — no polling.
- **Mock mode**: if backend-core is unreachable, the UI auto-loads `src/mockData.js` (shape mirrors `database/seed.sql`) so you can build the UI in isolation.

Explicit states handled: loading, empty, error.
