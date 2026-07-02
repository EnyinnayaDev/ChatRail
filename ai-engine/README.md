# ai-engine — Python (FastAPI + Gemini)

Standalone multimodal parser. Extracts a structured order from Nigerian pidgin / English chat text or an audio voice note.

## Stack
- Python 3.11 · FastAPI · uvicorn · `google-generativeai` (Gemini)

## Run
```bash
cp .env.example .env          # set GEMINI_API_KEY
pip install -r requirements.txt
uvicorn app:app --port 5000 --reload
```

If `GEMINI_API_KEY` is not set (or `AI_MOCK=True`), the service falls back to a **deterministic rule-based mock** so both frontends can be developed offline.

## Endpoint

`POST /api/ai/parse-order`

Body — either shape:
```json
{ "merchant_id": "<uuid>", "message_text": "Abeg send two black tracksuits to FUTO front gate" }
```
or
```json
{ "merchant_id": "<uuid>", "audio_base64": "<base64 wav/mp3>", "audio_mime": "audio/wav" }
```

Response (always this exact schema, no markdown fences):
```json
{
  "items": [{ "item": "Black tracksuit", "qty": 2, "size": "M", "color": "black" }],
  "delivery_address": "FUTO front gate",
  "delivery_type": "rider",
  "missing_fields": [],
  "follow_up_question": null,
  "confidence": "high"
}
```

## Eval
```bash
python eval.py             # runs test_phrases.json against the live endpoint
```
Fails if any response isn't valid JSON matching the schema. Ships with 6 varied Nigerian pidgin / English test phrases.
