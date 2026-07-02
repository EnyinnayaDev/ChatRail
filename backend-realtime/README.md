# backend-realtime — Node.js (Express + ws + pg)

Webhook + real-time layer. Runs as its own process on **port 4000**, separate from Django.

## Stack
- Node 20 · Express · `ws` · `pg` · `dotenv`

## Run
```bash
cp .env.example .env
npm install
npm run dev
```

## Endpoints
| Method | Path | Purpose |
|---|---|---|
| POST  | `/api/webhooks/opay`                      | OPay payment confirmation (idempotent) |
| PATCH | `/api/orders/:id/assign-rider`            | → `out_for_delivery` |
| PATCH | `/api/orders/:id/deliver`                 | → `delivered` |
| GET   | `/health`                                 | Health check |
| WS    | `/ws?merchant_id=<uuid>`                  | Live status broadcasts |

## State machine
```
pending_approval → awaiting_payment → paid → out_for_delivery → delivered
(any)            → cancelled
```
Any other transition returns HTTP **409**.

## Webhook simulation
```bash
curl -X POST localhost:4000/api/webhooks/opay \
  -H "Content-Type: application/json" \
  -d '{"reference":"SWO-ABCDEF123456","amount":"15000.00","status":"SUCCESS"}'
```
Repeat the same call — the second one is a no-op (idempotent).

## WebSocket smoke test
```bash
npx wscat -c 'ws://localhost:4000/ws?merchant_id=11111111-1111-1111-1111-111111111111'
```
Then trigger the webhook or a PATCH — the client receives `{ order_id, status, event_type }` within ~1s.
