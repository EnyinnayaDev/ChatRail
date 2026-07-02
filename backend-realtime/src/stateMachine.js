/**
 * Order state machine.
 *
 * pending_approval → awaiting_payment → paid → out_for_delivery → delivered
 * (any)            → cancelled
 */
export const STATUSES = [
  "pending_approval",
  "awaiting_payment",
  "paid",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const ALLOWED = {
  pending_approval:  new Set(["awaiting_payment", "cancelled"]),
  awaiting_payment:  new Set(["paid", "cancelled"]),
  paid:              new Set(["out_for_delivery", "cancelled"]),
  out_for_delivery:  new Set(["delivered", "cancelled"]),
  delivered:         new Set([]),
  cancelled:         new Set([]),
};

export function canTransition(from, to) {
  if (!STATUSES.includes(from) || !STATUSES.includes(to)) return false;
  return ALLOWED[from]?.has(to) ?? false;
}

export function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    const err = new Error(
      `Illegal state transition: ${from} → ${to}`
    );
    err.statusCode = 409;
    throw err;
  }
}
