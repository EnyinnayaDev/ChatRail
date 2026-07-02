# OPay SwiftOrder

Hackathon project (OPay × Google Gemini). Turns unstructured WhatsApp / Instagram chats and voice notes into structured, verified, trackable orders.

## Flow

1. Customer sends a chat message or voice note (**frontend-chat-sandbox**).
2. **ai-engine** (Gemini) extracts a structured order.
3. Seller approves it on the **frontend-dashboard** (kanban board).
4. **backend-core** (Django) generates an OPay sandbox payment link.
5. Customer pays → **backend-realtime** (Node) receives the OPay webhook, verifies it, flips the order to `paid`.
6. Both screens update **live** via WebSocket — no polling, no screenshot fraud.

## Services

| Folder | Stack | Port | Role |
|---|---|---|---|
| `database/` | PostgreSQL 15 | 5432 | Shared schema (single source of truth) |
| `backend-core/` | Python · Django · DRF | 8000 | REST API, orders, merchants, payment link |
| `backend-realtime/` | Node.js · Express · ws · pg | 4000 | Webhooks + state machine + WebSocket |
| `ai-engine/` | Python · FastAPI · Gemini | 5000 | Multimodal order extraction |
| `frontend-dashboard/` | React (Vite) | 5173 | Merchant kanban |
| `frontend-chat-sandbox/` | React (Vite) | 5174 | WhatsApp-style demo chat |

## Quick start

```bash
# 1. Start Postgres (schema + seed auto-loaded)
docker compose up -d

# 2. Backend-core (Django)
cd backend-core && cp .env.example .env && pip install -r requirements.txt
python manage.py migrate && python manage.py runserver 8000

# 3. Backend-realtime (Node)
cd ../backend-realtime && cp .env.example .env && npm install
npm run dev            # listens on :4000

# 4. AI engine
cd ../ai-engine && cp .env.example .env && pip install -r requirements.txt
uvicorn app:app --port 5000 --reload

# 5. Merchant dashboard
cd ../frontend-dashboard && npm install && npm run dev   # :5173

# 6. Chat sandbox
cd ../frontend-chat-sandbox && npm install && npm run dev   # :5174
```

For a zero-setup run of `backend-core`, set `USE_SQLITE=True` in its `.env` and you can skip Docker entirely.

## Contract rules

- `database/schema.sql` is the single source of truth. Only `backend-core` runs migrations.
- Every other service reads/writes the exact same columns via its own DB driver — no new tables, no renamed columns.
- Endpoints listed in each service's README are a contract — other services depend on them.
