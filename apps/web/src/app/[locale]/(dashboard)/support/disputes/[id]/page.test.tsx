import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Same regression shape as apps/web's orders/[id]/page.test.tsx: proves the right
// component is used AND that the [id] segment actually reaches it.
vi.mock("@/features/trust-safety/components/dispute-detail-screen", () => ({
  DisputeDetailScreen: ({ id }: { id: string }) => (
    <div data-testid="dispute-detail-screen">{id}</div>
  ),
}));

import DisputeDetailPage from "./page";

describe("DisputeDetailPage", () => {
  it("extracts the [id] route param and passes it to DisputeDetailScreen", async () => {
    const element = await DisputeDetailPage({ params: Promise.resolve({ id: "dispute-abc-123" }) });
    render(element);

    expect(screen.getByTestId("dispute-detail-screen")).toHaveTextContent("dispute-abc-123");
  });
});
