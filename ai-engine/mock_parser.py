"""
Deterministic rule-based fallback so frontends can develop offline
without a Gemini API key.
"""
import re

NUMBER_WORDS = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
}
SIZES = {"small": "S", "medium": "M", "large": "L", "xl": "XL", "xxl": "XXL",
         "s": "S", "m": "M", "l": "L"}
COLORS = ["black", "white", "red", "blue", "green", "yellow", "brown", "grey", "gray", "purple", "pink"]


def parse(message_text: str) -> dict:
    text = (message_text or "").lower().strip()

    # qty
    qty = 1
    m = re.search(r"\b(\d+)\b", text)
    if m:
        qty = int(m.group(1))
    else:
        for w, n in NUMBER_WORDS.items():
            if re.search(rf"\b{w}\b", text):
                qty = n
                break

    # size
    size = None
    for kw, code in SIZES.items():
        if re.search(rf"\b{kw}\b", text):
            size = code
            break

    # color
    color = None
    for c in COLORS:
        if c in text:
            color = c
            break

    # item name — very rough: last noun-ish word cluster
    item = "Item"
    for candidate in ["tracksuit", "shirt", "gown", "jollof", "shoe", "shoes", "bag", "cap",
                      "dress", "trouser", "trousers", "jeans", "hoodie", "sneakers"]:
        if candidate in text:
            item = candidate.capitalize()
            break
    if color:
        item = f"{color.capitalize()} {item.lower()}"

    # address
    address = None
    m = re.search(r"(?:to|for|at)\s+([a-z0-9 ,'\-]+?)(?:$|[.!?])", text)
    if m:
        address = m.group(1).strip().title()

    # delivery type
    delivery_type = "rider" if any(w in text for w in ["send", "deliver", "bring", "dispatch"]) else None
    if "pick up" in text or "pickup" in text or "come collect" in text:
        delivery_type = "pickup"

    missing = []
    if not address:
        missing.append("delivery_address")

    follow_up = None
    if missing:
        follow_up = "Where should we deliver it?"

    return {
        "items": [{"item": item, "qty": qty, "size": size, "color": color}],
        "delivery_address": address,
        "delivery_type": delivery_type,
        "missing_fields": missing,
        "follow_up_question": follow_up,
        "confidence": "medium",
    }
