# backend-core — Django + DRF

Core REST API. Models mirror `database/schema.sql` 1:1.

## Stack
- Python 3.11 · Django 5 · Django REST Framework · psycopg2 · django-cors-headers

## Run
```bash
cp .env.example .env
python -m venv .venv
pip install -r requirements.txt
python manage.py migrate      # only this service runs migrations
python manage.py runserver 8000
```

Zero-setup mode (no Docker): set `USE_SQLITE=True` in `.env`.

## Endpoints (contract)
| Method | Path | Purpose |
|---|---|---|
| POST  | `/api/merchants/`                  | Register merchant |
| GET   | `/api/merchants/<id>/`             | Fetch merchant |
| POST  | `/api/orders/`                     | Create draft order (status = pending_approval) |
| GET   | `/api/orders/?merchant_id=&status=`| Filtered list (powers dashboard kanban) |
| GET   | `/api/orders/<id>/`                | Order detail + `order_events` history |
| PATCH | `/api/orders/<id>/approve/`        | Set total_amount, → awaiting_payment |
| POST  | `/api/orders/<id>/payment-link/`   | Generate OPay sandbox link + reference |

## Smoke test
```bash
# create merchant
curl -X POST localhost:8000/api/merchants/ -H "Content-Type: application/json" \
  -d '{"name":"Ada","phone":"+2348010000000","business_type":"apparel"}'

# create order
curl -X T localhost:8000/api/orders/ -H "Content-Type: application/json" \
  -d '{"merchant_id":"<id>","items":[{"item":"Black shirt","qty":2}],"delivery_address":"FUTO","delivery_type":"rider"}'

curl -X POST http://localhost:8000/api/orders/ \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_id": "309c0242-afb6-41c6-b2c6-4e61f6a16e3f",
    "items": [
      {
        "item": "T-Shirt",
        "qty": 2
      }
    ]
  }'

# approve
curl -X PATCH localhost:8000/api/orders/<order_id>/approve/ \
  -H "Content-Type: application/json" -d '{"total_amount":8000}'

curl -X PATCH http://localhost:8000/api/orders/19cd6f25-f1f7-4f3c-8b6e-ad6fc0f06efc/approve/ \
  -H "Content-Type: application/json" \
  -d '{"total_amount":8000}'

# payment link
curl -X POST localhost:8000/api/orders/<order_id>/payment-link/

curl -X POST http://localhost:8000/api/orders/19cd6f25-f1f7-4f3c-8b6e-ad6fc0f06efc/payment-link/
```

## OPay sandbox note
`OPAY_SANDBOX_BASE_URL` in `.env` is a **placeholder**. The real sandbox base URL / auth key must be confirmed from the OPay Business Dashboard (Nigeria). Do not treat the current value as final.
