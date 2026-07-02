# frontend-chat-sandbox — React (Vite)

WhatsApp-style demo chat. **Port 5174.** This is the highest-visibility screen on demo day — prioritized to look convincingly like real WhatsApp (bubbles, timestamps, mic button).

## Stack
- React 18 · Vite 5 · plain HTML/CSS (no Tailwind)
- `MediaRecorder` for voice notes with graceful mic-permission fallback

## Run
```bash
npm install
npm run dev
```
Open http://localhost:5174 (open the dashboard at :5173 in a second window for the full demo).

## Behaviour
- Type a message or hold the mic button to record a voice note.
- Message is sent to **ai-engine** `POST /api/ai/parse-order`.
- Response is rendered back into the chat as a system "confirmation card" (items · address · confidence).
- Once the seller approves (on the dashboard, on `awaiting_payment`), the chat shows a payment-link message with the **"🔒 Secured by OPay — no screenshots needed"** banner.
- Reuses **backend-realtime** WebSocket (same `merchant_id`) to render `Payment confirmed ✅` / `Rider assigned` system messages live — no polling.
- If **ai-engine** is unreachable, falls back to `src/mockAi.js` so the demo still runs.

## Demo flow
1. Type: *"Abeg send two medium black tracksuits to FUTO front gate"*
2. See structured confirmation card appear.
3. Switch to the dashboard (:5173), approve the order, set ₦8000.
4. Back in this chat, a payment-link message appears live.
5. Simulate the OPay webhook (see `backend-realtime/README.md`) — chat shows `Payment confirmed ✅`.
