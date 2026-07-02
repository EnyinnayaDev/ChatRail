# backend-core — Backend Dev 1

**Language:** Python (Django + Django REST Framework recommended, or FastAPI)

Core REST API + database ownership. This is where merchants and orders get
created, listed, approved, and where the OPay payment link gets generated.

Full brief, endpoint list, and JSON contracts: `/docs/1_Backend_Dev1_Core_API.docx`
Schema you're building against: `/database/schema.sql`

## Getting started

Nothing's scaffolded yet — start your project here, e.g.:

```bash
django-admin startproject config .
python manage.py startapp orders
```

Point your DB connection at the shared Postgres instance (see root README for
`docker compose up`), and build your models to match `/database/schema.sql`
exactly — Backend Dev 2 depends on those table/column names staying stable.
