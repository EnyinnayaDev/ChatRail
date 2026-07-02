import http from "node:http";
import { URL } from "node:url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";

import { joinRoom } from "./broadcaster.js";
import { transitionOrder, confirmPayment } from "./orders.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true, service: "backend-realtime" }));

/* ---------- OPay webhook ---------- */
app.post("/api/webhooks/opay", async (req, res) => {
  const { reference, amount, status } = req.body || {};
  if (!reference || amount === undefined) {
    return res.status(400).json({ detail: "reference and amount required" });
  }
  // Only treat explicit success as paid.
  if (status && String(status).toUpperCase() !== "SUCCESS") {
    return res.status(202).json({ detail: `Ignored status=${status}` });
  }
  try {
    const result = await confirmPayment({ reference, amount });
    return res.json(result);
  } catch (e) {
    return res.status(e.statusCode || 500).json({ detail: e.message });
  }
});

/* ---------- PATCH rider assignment ---------- */
app.patch("/api/orders/:id/assign-rider", async (req, res) => {
  try {
    const payload = { rider: req.body?.rider || null };
    const result = await transitionOrder(req.params.id, "out_for_delivery", "rider_assigned", payload);
    return res.json(result);
  } catch (e) {
    return res.status(e.statusCode || 500).json({ detail: e.message });
  }
});

/* ---------- PATCH deliver ---------- */
app.patch("/api/orders/:id/deliver", async (req, res) => {
  try {
    const result = await transitionOrder(req.params.id, "delivered", "delivered", {});
    return res.json(result);
  } catch (e) {
    return res.status(e.statusCode || 500).json({ detail: e.message });
  }
});

/* ---------- HTTP + WS ---------- */
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (req, socket, head) => {
  const { pathname, searchParams } = new URL(req.url, "http://localhost");
  if (pathname !== "/ws") {
    socket.destroy();
    return;
  }
  const merchantId = searchParams.get("merchant_id");
  if (!merchantId) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
    return;
  }
  wss.handleUpgrade(req, socket, head, (ws) => {
    joinRoom(merchantId, ws);
    ws.send(JSON.stringify({ type: "hello", merchant_id: merchantId }));
  });
});

const PORT = Number(process.env.PORT || 4000);
server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[backend-realtime] http+ws listening on :${PORT}`);
});
