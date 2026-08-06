import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Regression test for a real, previously-shipped bug: this page used to render
// the wrong component entirely (list-view OrdersScreen, reused by mistake)
// and never extracted its own route param. Mocking OrderDetailScreen to render
// the prop it received proves both that the right component is used AND that
// the [id] segment actually reaches it.
vi.mock("@/features/orders/components/order-detail-screen", () => ({
  OrderDetailScreen: ({ orderId }: { orderId: string }) => (
    <div data-testid="order-detail-screen">{orderId}</div>
  ),
}));

import OrderDetailsPage from "./page";

describe("OrderDetailsPage", () => {
  it("extracts the [id] route param and passes it to OrderDetailScreen", async () => {
    const element = await OrderDetailsPage({ params: Promise.resolve({ id: "order-abc-123" }) });
    render(element);

    expect(screen.getByTestId("order-detail-screen")).toHaveTextContent("order-abc-123");
  });

  it("passes a different id through unchanged for a different order", async () => {
    const element = await OrderDetailsPage({ params: Promise.resolve({ id: "order-xyz-999" }) });
    render(element);

    expect(screen.getByTestId("order-detail-screen")).toHaveTextContent("order-xyz-999");
  });
});
