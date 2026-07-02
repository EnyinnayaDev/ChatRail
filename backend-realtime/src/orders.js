import { pool } from "./db.js";
import { assertTransition } from "./stateMachine.js";
import { broadcast } from "./broadcaster.js";

export async function getOrder(orderId) {
  const { rows } = await pool.query(
    `SELECT id, merchant_id, status, total_amount, opay_tx_reference
       FROM orders WHERE id = $1`,
    [orderId]
  );
  return rows[0] || null;
}

/**
 * Transition an order + write an event + broadcast — atomically.
 */
export async function transitionOrder(orderId, targetStatus, eventType, payload = {}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `SELECT id, merchant_id, status FROM orders WHERE id = $1 FOR UPDATE`,
      [orderId]
    );
    if (!rows[0]) {
      const err = new Error("Order not found");
      err.statusCode = 404;
      throw err;
    }
    const order = rows[0];
    assertTransition(order.status, targetStatus);

    await client.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`,
      [targetStatus, orderId]
    );
    await client.query(
      `INSERT INTO order_events (order_id, event_type, payload)
       VALUES ($1, $2, $3::jsonb)`,
      [orderId, eventType, JSON.stringify(payload)]
    );
    await client.query("COMMIT");

    broadcast(order.merchant_id, {
      order_id: orderId,
      status: targetStatus,
      event_type: eventType,
    });

    return { order_id: orderId, status: targetStatus };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Idempotent payment confirmation.
 * Returns { deduped: true } if this webhook was already processed.
 */
export async function confirmPayment({ reference, amount }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `SELECT id, merchant_id, status, total_amount
         FROM orders WHERE opay_tx_reference = $1 FOR UPDATE`,
      [reference]
    );
    if (!rows[0]) {
      const err = new Error(`No order for reference ${reference}`);
      err.statusCode = 404;
      throw err;
    }
    const order = rows[0];

    // Log the webhook receipt (audit trail — every hit, even dupes)
    await client.query(
      `INSERT INTO order_events (order_id, event_type, payload)
       VALUES ($1, 'webhook_received', $2::jsonb)`,
      [order.id, JSON.stringify({ reference, amount })]
    );

    // Idempotency guard — already paid, don't double-process.
    if (order.status === "paid" || order.status === "out_for_delivery" || order.status === "delivered") {
      await client.query("COMMIT");
      return { deduped: true, order_id: order.id, status: order.status };
    }

    // Amount check
    const expected = Number(order.total_amount);
    const got = Number(amount);
    if (!expected || Number.isNaN(got) || Math.abs(expected - got) > 0.001) {
      await client.query("COMMIT"); // still log, don't rollback the audit row
      const err = new Error(`Amount mismatch: expected ${expected}, got ${got}`);
      err.statusCode = 400;
      throw err;
    }

    assertTransition(order.status, "paid");
    await client.query(
      `UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = $1`,
      [order.id]
    );
    await client.query(
      `INSERT INTO order_events (order_id, event_type, payload)
       VALUES ($1, 'paid', $2::jsonb)`,
      [order.id, JSON.stringify({ reference, amount })]
    );
    await client.query("COMMIT");

    broadcast(order.merchant_id, {
      order_id: order.id,
      status: "paid",
      event_type: "paid",
    });

    return { deduped: false, order_id: order.id, status: "paid" };
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}
