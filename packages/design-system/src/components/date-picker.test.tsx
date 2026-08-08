import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DatePicker } from "./date-picker";

describe("DatePicker", () => {
  it("renders a trigger button showing the placeholder when no date is selected", () => {
    render(<DatePicker label="Delivery date" placeholder="Pick a date" />);
    // The <label> association gives the button its accessible name ("Delivery
    // date"); the placeholder is the button's visible, unselected-state text.
    expect(screen.getByRole("button", { name: "Delivery date" })).toHaveTextContent("Pick a date");
  });

  it("opens a calendar dialog on click", async () => {
    const user = userEvent.setup();
    render(<DatePicker label="Delivery date" />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog", { name: /choose date/i })).toBeInTheDocument();
  });

  it("calls onChange with the clicked day and closes the calendar", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(date: Date) => void>();
    const fixedToday = new Date(2026, 0, 15);
    render(<DatePicker label="Delivery date" defaultValue={fixedToday} onChange={onChange} />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("gridcell", { name: "20" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const [received] = onChange.mock.calls[0];
    expect(received.getDate()).toBe(20);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders the error message and marks the trigger invalid", () => {
    render(<DatePicker label="Delivery date" error="Required" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    expect(screen.getByRole("button")).toHaveAttribute("aria-invalid", "true");
  });
});
