/**
 * Per-merchant WebSocket rooms.
 * One process = one in-memory Map<merchant_id, Set<ws>>.
 */
const rooms = new Map();

export function joinRoom(merchantId, ws) {
  if (!rooms.has(merchantId)) rooms.set(merchantId, new Set());
  rooms.get(merchantId).add(ws);
  ws.on("close", () => leaveRoom(merchantId, ws));
}

export function leaveRoom(merchantId, ws) {
  const room = rooms.get(merchantId);
  if (!room) return;
  room.delete(ws);
  if (room.size === 0) rooms.delete(merchantId);
}

export function broadcast(merchantId, payload) {
  const room = rooms.get(merchantId);
  if (!room) return 0;
  const msg = JSON.stringify(payload);
  let sent = 0;
  for (const ws of room) {
    if (ws.readyState === 1 /* OPEN */) {
      ws.send(msg);
      sent++;
    }
  }
  return sent;
}
