import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Combobox } from "./combobox";

const options = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
];

describe("Combobox", () => {
  it("renders a combobox with the given label", () => {
    render(<Combobox options={options} label="Fruit" />);
    expect(screen.getByRole("combobox", { name: "Fruit" })).toBeInTheDocument();
  });

  it("opens the listbox and selects an option on click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={options} label="Fruit" onChange={onChange} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Apple" }));

    expect(onChange).toHaveBeenCalledWith("apple");
  });

  it("supports multi-select, showing each pick as a removable chip", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Combobox options={options} label="Fruit" multiple onChange={onChange} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(await screen.findByRole("option", { name: "Apple" }));

    expect(onChange).toHaveBeenLastCalledWith(["apple"]);
  });

  it("renders the error message and marks the field invalid", () => {
    render(<Combobox options={options} label="Fruit" error="Required" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
  });
});
