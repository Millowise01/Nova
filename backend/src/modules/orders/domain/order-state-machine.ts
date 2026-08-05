// The 8 states from backend/docs/00-bounded-contexts.md / 07-glossary.md, enforced at
// the application layer — never a free-text status column (Vol 2, D2).
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "returned";

const LEGAL_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["completed", "returned"],
  completed: ["returned"],
  cancelled: [],
  returned: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return LEGAL_TRANSITIONS[from].includes(to);
}

/** Cancellation is only legal before the order has shipped — once a rider has it, this
 *  becomes a Logistics failed-delivery/return concern (Phase 2+, out of scope). */
export function canCancel(status: OrderStatus): boolean {
  return canTransition(status, "cancelled");
}
