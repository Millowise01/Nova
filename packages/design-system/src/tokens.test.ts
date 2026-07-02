import { describe, expect, it } from "vitest";
import { tokens } from "./tokens";

describe("design system tokens", () => {
  it("exposes the base spacing scale", () => {
    expect(tokens.spacing[4]).toBe("1rem");
  });
});
