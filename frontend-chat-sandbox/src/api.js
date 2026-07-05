import { AI_BASE, API_BASE, DEMO_MERCHANT_ID } from "./config.js";
import { mockAiParse } from "./mockAi.js";

async function j(res) {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function parseOrder({ message_text, audio_base64, audio_mime }) {
  try {
    const body = { merchant_id: DEMO_MERCHANT_ID };
    if (audio_base64) { body.audio_base64 = audio_base64; body.audio_mime = audio_mime; }
    else              { body.message_text = message_text; }
    console.log(body);
    const res = await fetch(`${AI_BASE}/api/ai/parse-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return { data: await j(res), source: "ai-engine" };
  } catch (e) {
    // fallback for offline dev
    console.warn("[chat] ai-engine unreachable, using mock:", e.message);
    return { data: mockAiParse(message_text || "one item"), source: "mock" };
  }
}

export async function createOrder(parsed, rawMessage) {
  try {
    const res = await fetch(`${API_BASE}/api/orders/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant_id: DEMO_MERCHANT_ID,
        items: parsed.items,
        delivery_address: parsed.delivery_address,
        delivery_type: parsed.delivery_type,
        raw_message: rawMessage,
        ai_confidence: parsed.confidence,
      }),
    });
    return await j(res);
  } catch (e) {
    console.warn("[chat] backend-core unreachable — order not persisted:", e.message);
    return null;
  }
}

export async function fetchOrder(orderId) {
  const res = await fetch(`${API_BASE}/api/orders/${orderId}/`);
  return j(res);
}
