import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ToastProvider, useToast } from "./toast";

function Probe() {
  const { toast, toasts } = useToast();
  return (
    <div>
      <span data-testid="count">{toasts.length}</span>
      <button onClick={() => toast.success("Saved")}>success</button>
      <button onClick={() => toast.error("Failed")}>error</button>
      <button onClick={() => toast.info("Sticky", 0)}>sticky</button>
      <button onClick={() => toast.warning("Short", 1000)}>short</button>
    </div>
  );
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function renderProbe() {
  return render(
    <ToastProvider>
      <Probe />
    </ToastProvider>,
  );
}

describe("ToastProvider", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders a toast for each helper, with the message", () => {
    renderProbe();
    act(() => screen.getByText("success").click());
    act(() => screen.getByText("error").click());

    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByTestId("count")).toHaveTextContent("2");
  });

  it("dismisses a toast after the default four seconds", () => {
    renderProbe();
    act(() => screen.getByText("success").click());

    advance(3999);
    expect(screen.getByText("Saved")).toBeInTheDocument();

    advance(1);
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("honours an explicit duration, and a duration of 0 never auto-dismisses", () => {
    renderProbe();
    act(() => screen.getByText("short").click());
    act(() => screen.getByText("sticky").click());

    advance(1000);
    expect(screen.queryByText("Short")).not.toBeInTheDocument();
    expect(screen.getByText("Sticky")).toBeInTheDocument();

    advance(60_000);
    expect(screen.getByText("Sticky")).toBeInTheDocument();
  });

  it("removes only the dismissed toast", () => {
    renderProbe();
    act(() => screen.getByText("sticky").click());
    act(() => screen.getByText("success").click());

    const dismissButtons = screen.getAllByRole("button", { name: "Dismiss" });
    act(() => dismissButtons[0].click());

    expect(screen.queryByText("Sticky")).not.toBeInTheDocument();
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("gives every toast its own id, so two identical messages are two toasts", () => {
    renderProbe();
    act(() => screen.getByText("success").click());
    act(() => screen.getByText("success").click());
    expect(screen.getAllByText("Saved")).toHaveLength(2);
  });

  it("useToast outside a provider fails loudly", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(<Probe />)).toThrow("useToast must be used within ToastProvider");
    spy.mockRestore();
  });
});
