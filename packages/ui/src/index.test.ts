import { describe, expect, it } from "vitest";
import { cn } from "./index";

describe("@nova/ui facade", () => {
  it("re-exports cn from @nova/utils", () => {
    expect(cn("a", "b")).toBe("a b");
  });
});
