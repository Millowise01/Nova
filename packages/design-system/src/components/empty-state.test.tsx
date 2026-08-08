import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  NoProductsEmptyState,
  NoOrdersEmptyState,
  NoResultsEmptyState,
  NoNotificationsEmptyState,
} from "./empty-state";

describe("typed EmptyState presets", () => {
  it("NoProductsEmptyState renders its default copy", () => {
    render(<NoProductsEmptyState />);
    expect(screen.getByText("No products found")).toBeInTheDocument();
  });

  it("NoOrdersEmptyState renders its default copy", () => {
    render(<NoOrdersEmptyState />);
    expect(screen.getByText("No orders yet")).toBeInTheDocument();
  });

  it("NoResultsEmptyState renders its default copy", () => {
    render(<NoResultsEmptyState />);
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("NoNotificationsEmptyState renders its default copy", () => {
    render(<NoNotificationsEmptyState />);
    expect(screen.getByText("You're all caught up")).toBeInTheDocument();
  });

  it("allows overriding the title while keeping the preset icon", () => {
    render(<NoProductsEmptyState title="No matching products" />);
    expect(screen.getByText("No matching products")).toBeInTheDocument();
  });
});
