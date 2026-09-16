import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { NewsletterSection } from "./newsletter-section";

describe("NewsletterSection", () => {
  it("shows no message before the form has been submitted", () => {
    render(<NewsletterSection />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows an honest 'not available yet' message on submit instead of a fake success", async () => {
    render(<NewsletterSection />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "shopper@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /subscribe/i }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/aren't available yet/i),
    );
  });
});
