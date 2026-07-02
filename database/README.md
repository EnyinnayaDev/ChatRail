# Database

Single shared PostgreSQL database. Backend Dev 1 (Python) owns this schema going
forward and will generate Django migrations from it; Backend Dev 2 (Node.js)
connects to the same database directly and never runs its own migrations.

## Start it

```bash
docker compose up -d
```

This spins up Postgres on `localhost:5432` (db: `swiftorder`, user/pass: `postgres`/`postgres`)
with `schema.sql` and `seed.sql` applied automatically on first run.

No Docker? Run the two files manually against any local Postgres instance:

```bash
psql -U postgres -d swiftorder -f database/schema.sql
psql -U postgres -d swiftorder -f database/seed.sql
```

## Files

- `schema.sql` — the three core tables (`merchants`, `orders`, `order_events`) and their indexes.
- `seed.sql` — sample merchant + orders in a few different statuses, so frontend devs have
  realistic data to build against before the real API endpoints exist.

## Changing the schema

Only Backend Dev 1 edits `schema.sql`. If you're on another track and need a new column,
ask them to add it here first — don't add it directly in your own service's code.
