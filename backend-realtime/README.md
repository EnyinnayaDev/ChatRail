# backend-realtime — Backend Dev 2

**Language:** JavaScript (Node.js + Express)

Webhooks, order state machine, and the WebSocket layer that pushes live
status updates to the Merchant Dashboard.

Full brief, endpoint list, and the state machine diagram: `/docs/2_Backend_Dev2_Realtime_Webhooks.docx`
Schema you're connecting to (read/write only, no migrations): `/database/schema.sql`

## Getting started

Nothing's scaffolded yet — start your project here, e.g.:

```bash
npm init -y
npm install express pg ws dotenv cors
```

Connect to the same shared Postgres instance Backend Dev 1 uses (see root
README for `docker compose up`). Do not run migrations from this service —
if you need a schema change, ask Backend Dev 1 to add it to `/database/schema.sql`.
