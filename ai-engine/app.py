"""
FastAPI service — POST /api/ai/parse-order
"""
import os
from typing import Optional, List, Any
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import mock_parser

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")
print(f"Loaded .env from {BASE_DIR / '.env'}")

app = FastAPI(title="OPay SwiftOrder — ai-engine", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"], allow_credentials=True,
)


class ParseRequest(BaseModel):
    merchant_id: str
    message_text: Optional[str] = None
    audio_base64: Optional[str] = None
    audio_mime: Optional[str] = "audio/wav"


class Item(BaseModel):
    item: str
    qty: int
    size: Optional[str] = None
    color: Optional[str] = None


class ParseResponse(BaseModel):
    items: List[Item]
    delivery_address: Optional[str] = None
    delivery_type: Optional[str] = None
    missing_fields: List[str] = Field(default_factory=list)
    follow_up_question: Optional[str] = None
    confidence: str = "medium"


def _is_mock() -> bool:
    if os.getenv("AI_MOCK", "False").lower() == "true":
        return True
    return not bool(os.getenv("GEMINI_API_KEY"))


def _normalize(raw: Any) -> dict:
    """Coerce a Gemini/mock dict into the strict response schema."""
    if not isinstance(raw, dict):
        raise ValueError("Model did not return an object")
    items = raw.get("items") or []
    fixed_items = []
    for it in items:
        if not isinstance(it, dict):
            continue
        fixed_items.append({
            "item": str(it.get("item", "")).strip() or "Item",
            "qty": int(it.get("qty") or 1),
            "size": it.get("size"),
            "color": it.get("color"),
        })
    return {
        "items": fixed_items or [{"item": "Item", "qty": 1, "size": None, "color": None}],
        "delivery_address": raw.get("delivery_address"),
        "delivery_type": raw.get("delivery_type"),
        "missing_fields": list(raw.get("missing_fields") or []),
        "follow_up_question": raw.get("follow_up_question"),
        "confidence": raw.get("confidence") or "medium",
    }


@app.get("/health")
def health():
    return {"ok": True, "service": "ai-engine", "mode": "mock" if _is_mock() else "gemini"}


@app.post("/api/ai/parse-order", response_model=ParseResponse)
def parse_order(req: ParseRequest):
    if not req.message_text and not req.audio_base64:
        raise HTTPException(400, "Provide message_text or audio_base64")

    try:
        if _is_mock():
            # Mock only supports text; if audio arrives in mock mode, use a placeholder transcript.
            text = req.message_text or "one item to unknown location"
            raw = mock_parser.parse(text)
        else:
            # Lazy import so mock mode doesn't require the SDK.
            from gemini_client import parse_text, parse_audio
            if req.audio_base64:
                raw = parse_audio(req.audio_base64, req.audio_mime or "audio/wav")
            else:
                raw = parse_text(req.message_text or "")
        return _normalize(raw)
    except HTTPException:
        raise
    except Exception as e:
        # Never leak a stack trace to the client — but do surface the reason.
        raise HTTPException(500, f"ai-engine error: {type(e).__name__}: {e}")
