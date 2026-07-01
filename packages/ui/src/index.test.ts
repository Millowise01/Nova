import { describe, expect, it } from "vitest";
import { tokens } from "@nova/design-system";

describe("ui facade", () => {
  it("re-exports the design-system foundation", () => {
    expect(tokens.radius.pill).toBe("9999px");
  });
});
