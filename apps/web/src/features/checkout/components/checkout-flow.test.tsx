import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/features/orders/orders.mutations", () => ({
  useCreateOrderMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

import { CheckoutFlow } from "./checkout-flow";

// Regression test for the idempotency-key contract: the key must be generated
// ONCE per checkout attempt (via useState(() => crypto.randomUUID())) and
// reused across every re-render/retry of that same attempt — never
// regenerated on each render, which would break the backend's Idempotency-Key
// dedup and let a double-click place two orders.
describe("CheckoutFlow idempotency key", () => {
  it("generates the idempotency key exactly once per mount, not on every re-render", () => {
    const randomUUIDSpy = vi.spyOn(crypto, "randomUUID");

    const { rerender } = render(<CheckoutFlow />);
    expect(randomUUIDSpy).toHaveBeenCalledTimes(1);

    rerender(<CheckoutFlow />);
    rerender(<CheckoutFlow />);
    expect(randomUUIDSpy).toHaveBeenCalledTimes(1);

    randomUUIDSpy.mockRestore();
  });

  it("generates a fresh key on remount (a genuinely new attempt)", () => {
    const randomUUIDSpy = vi.spyOn(crypto, "randomUUID");

    const first = render(<CheckoutFlow />);
    first.unmount();
    render(<CheckoutFlow />);

    expect(randomUUIDSpy).toHaveBeenCalledTimes(2);

    randomUUIDSpy.mockRestore();
  });
});
