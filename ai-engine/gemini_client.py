"""
Thin wrapper around google-generativeai. Handles both text and audio input.
"""
import base64
import json
import os
import re

import google.generativeai as genai
from prompt import SYSTEM_PROMPT


def _configure():
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    genai.configure(api_key=key)


def _strip_fences(raw: str) -> str:
    """Remove ```json ... ``` fences if the model added them anyway."""
    raw = raw.strip()
    fence = re.match(r"^```(?:json)?\s*(.*?)\s*```$", raw, re.DOTALL)
    if fence:
        raw = fence.group(1).strip()
    return raw


def parse_text(message_text: str) -> dict:
    _configure()
    model = genai.GenerativeModel(
        os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
        system_instruction=SYSTEM_PROMPT,
        generation_config={"response_mime_type": "application/json"},
    )
    resp = model.generate_content(message_text or "")
    return json.loads(_strip_fences(resp.text))


def parse_audio(audio_base64: str, mime: str = "audio/wav") -> dict:
    _configure()
    model = genai.GenerativeModel(
        os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
        system_instruction=SYSTEM_PROMPT,
        generation_config={"response_mime_type": "application/json"},
    )
    audio_bytes = base64.b64decode(audio_base64)
    resp = model.generate_content([
        {"mime_type": mime, "data": audio_bytes},
        "Transcribe this voice note and extract the order as JSON per the system rules.",
    ])
    return json.loads(_strip_fences(resp.text))
