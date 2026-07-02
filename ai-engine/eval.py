"""
Eval script — runs test phrases through the live /api/ai/parse-order
endpoint and flags any response that isn't valid JSON matching the schema.

Usage:
    python eval.py                       # hits http://localhost:5000
    python eval.py --url http://host:5000

Exit code 0 = all pass, 1 = any failure.
"""
import argparse
import json
import sys
from pathlib import Path

import httpx


REQUIRED_KEYS = {"items", "delivery_address", "delivery_type",
                 "missing_fields", "follow_up_question", "confidence"}
MERCHANT_ID = "11111111-1111-1111-1111-111111111111"


def check(resp_json: dict) -> list[str]:
    errors = []
    if not isinstance(resp_json, dict):
        return ["response is not a JSON object"]
    missing = REQUIRED_KEYS - resp_json.keys()
    if missing:
        errors.append(f"missing keys: {sorted(missing)}")

    items = resp_json.get("items")
    if not isinstance(items, list) or not items:
        errors.append("items must be a non-empty list")
    else:
        for i, it in enumerate(items):
            if not isinstance(it, dict):
                errors.append(f"items[{i}] not an object"); continue
            if not it.get("item"):
                errors.append(f"items[{i}].item missing")
            if not isinstance(it.get("qty"), int) or it["qty"] <= 0:
                errors.append(f"items[{i}].qty must be a positive int")

    if resp_json.get("confidence") not in {"high", "medium", "low"}:
        errors.append("confidence must be one of high|medium|low")

    if not isinstance(resp_json.get("missing_fields"), list):
        errors.append("missing_fields must be a list")

    return errors


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default="http://localhost:5000")
    args = ap.parse_args()

    phrases = json.loads(Path(__file__).with_name("test_phrases.json").read_text())
    failures = 0
    for i, phrase in enumerate(phrases, 1):
        try:
            r = httpx.post(
                f"{args.url}/api/ai/parse-order",
                json={"merchant_id": MERCHANT_ID, "message_text": phrase},
                timeout=30.0,
            )
            data = r.json()
        except json.JSONDecodeError:
            print(f"[{i}] ✗ non-JSON response for: {phrase!r}")
            failures += 1
            continue
        except Exception as e:
            print(f"[{i}] ✗ request error: {e}")
            failures += 1
            continue

        errs = check(data)
        if errs:
            print(f"[{i}] ✗ {phrase!r}")
            for e in errs:
                print(f"     - {e}")
            failures += 1
        else:
            summary = ", ".join(f"{it['qty']}× {it['item']}" for it in data["items"])
            print(f"[{i}] ✓ {phrase[:60]!r:65s} → {summary} → {data.get('delivery_address') or '(needs address)'}")

    print()
    if failures:
        print(f"FAILED: {failures}/{len(phrases)}")
        sys.exit(1)
    print(f"OK: all {len(phrases)} phrases returned valid JSON.")


if __name__ == "__main__":
    main()
