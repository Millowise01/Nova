/**
 * The assistant's policy knowledge base (Volume 4, Part B1 — "a maintained policy
 * knowledge base (shipping, returns, payment methods)"). Deliberately small and static
 * for this Stage 0 pass (Volume 4, Part A2), and every entry is grounded in something
 * this codebase actually implements today, with a real, checkable source — never a
 * plausible-sounding policy invented for this feature. Where the real system has no
 * policy yet (a return window, a delivery SLA), that is what the entry says, instead of
 * inventing a number.
 */
export interface PolicyEntry {
  /** Lowercase keywords matched against the caller's question. Deliberately plain
   *  keyword overlap, not embeddings/semantic search — Volume 4, Part A2's staged
   *  maturity model: a trained retrieval model is a later stage, once there's usage
   *  data to justify it, not a Stage 0 requirement. */
  keywords: string[];
  answer: string;
  source: string;
}

export const POLICY_KNOWLEDGE_BASE: PolicyEntry[] = [
  {
    keywords: ["ship", "shipping", "delivery", "deliver", "track", "tracking", "rider"],
    answer:
      "Once a seller confirms your order, it moves through packed, then a delivery rider takes it through picked up, in transit, and delivered. You can follow this from your order's details page. Nova does not currently publish a fixed delivery time estimate.",
    source:
      "backend/docs/10-logistics-finance-trust-safety-design.md (DeliveryJob status timeline)",
  },
  {
    keywords: ["return", "refund", "damaged", "wrong item", "dispute", "not as described"],
    answer:
      "If an order has a problem, open a dispute about it from the Dispute Center and describe what happened; it goes to Nova's review process from there. Nova does not currently publish a fixed return window or an automatic refund policy — a real person reviews each dispute.",
    source: "Trust & Safety Dispute flow (Support > Dispute Center)",
  },
  {
    keywords: ["pay", "payment", "checkout", "wallet", "card", "mobile money", "momo"],
    answer: "At checkout you can pay with your Nova wallet balance, a card, or mobile money.",
    source: "@nova/validation checkoutSchema (paymentMethod: wallet | card | mobile-money)",
  },
  {
    keywords: ["order status", "cancel order", "order state", "cancel"],
    answer:
      "An order moves through placed, confirmed, packed, shipped, delivered, and completed. You can cancel an order yourself while it's still early in that process, from the order's details page.",
    source: "backend/docs/00-bounded-contexts.md (Order state machine)",
  },
];

function matchesKeyword(normalized: string, keyword: string): boolean {
  // Word-boundary match, not a raw substring check: `.includes("card")` would also match
  // "gift cards", wrongly citing the payment-methods entry for an unrelated question.
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`).test(normalized);
}

/** Simple keyword-overlap match — the caller's question is lowercased and checked
 *  against each entry's keywords. Returns null (no confident match) rather than the
 *  closest-but-wrong entry: a wrong policy citation is worse than a handoff. */
export function findPolicyAnswer(question: string): PolicyEntry | null {
  const normalized = question.toLowerCase();
  return (
    POLICY_KNOWLEDGE_BASE.find((entry) =>
      entry.keywords.some((keyword) => matchesKeyword(normalized, keyword)),
    ) ?? null
  );
}
