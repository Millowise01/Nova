import { describe, expect, it } from "vitest";

import { colors } from "./colors";
import { cssVars } from "./css-vars";
import { themes } from "./themes";
import { spacing, radius } from "./tokens";

describe("design system tokens", () => {
  it("exposes the base spacing scale", () => {
    expect(spacing[4]).toBe("1rem");
  });

  it("exposes radius tokens", () => {
    expect(radius.full).toBe("9999px");
  });
});

describe("Nova brand color palette", () => {
  it("navy base is #0D2A63", () => {
    expect(colors.navy[500]).toBe("#0D2A63");
  });

  it("orange base is #FF6A00", () => {
    expect(colors.orange[500]).toBe("#FF6A00");
  });

  it("peach base is #FFC8A3", () => {
    expect(colors.peach[500]).toBe("#FFC8A3");
  });

  it("accent blue base is #1A56DB", () => {
    expect(colors.blue[500]).toBe("#1A56DB");
  });

  it("neutral dark base is #111827", () => {
    expect(colors.neutral[900]).toBe("#111827");
  });

  it("exposes functional scales", () => {
    expect(colors.green[600]).toBe("#16a34a");
    expect(colors.amber[600]).toBe("#d97706");
    expect(colors.red[600]).toBe("#dc2626");
  });
});

describe("themes", () => {
  it("light primary is Nova Primary Blue", () => {
    expect(themes.light.primary).toBe("#0D2A63");
  });

  it("light accent is Nova Orange", () => {
    expect(themes.light.accent).toBe("#FF6A00");
  });

  it("light info is distinct from accent blue", () => {
    expect(themes.light.info).toBe("#2563EB");
    expect(themes.light.info).not.toBe(themes.light.borderFocus);
  });

  it("light foreground is Neutral Dark", () => {
    expect(themes.light.foreground).toBe("#111827");
  });

  it("dark primary is lightened navy for contrast", () => {
    expect(themes.dark.primary).toBe("#6690cf");
  });

  it("dark accent keeps Nova Orange", () => {
    expect(themes.dark.accent).toBe("#FF6A00");
  });

  it("all roles have hover, active, disabled states in light", () => {
    const roles = [
      "primary",
      "secondary",
      "accent",
      "success",
      "warning",
      "error",
      "info",
    ] as const;
    for (const role of roles) {
      expect(themes.light[`${role}Hover`]).toBeTruthy();
      expect(themes.light[`${role}Active`]).toBeTruthy();
      expect(themes.light[`${role}Disabled`]).toBeTruthy();
      expect(themes.light[`${role}Foreground`]).toBeTruthy();
    }
  });
});

describe("cssVars", () => {
  it("primary maps to --color-primary", () => {
    expect(cssVars.color.primary).toBe("var(--color-primary)");
  });

  it("accent maps to --color-accent", () => {
    expect(cssVars.color.accent).toBe("var(--color-accent)");
  });

  it("exposes all state variants for primary", () => {
    expect(cssVars.color.primaryHover).toBe("var(--color-primary-hover)");
    expect(cssVars.color.primaryActive).toBe("var(--color-primary-active)");
    expect(cssVars.color.primaryDisabled).toBe("var(--color-primary-disabled)");
    expect(cssVars.color.primarySubtle).toBe("var(--color-primary-subtle)");
    expect(cssVars.color.primaryForeground).toBe("var(--color-primary-foreground)");
    expect(cssVars.color.primaryBorder).toBe("var(--color-primary-border)");
  });

  it("exposes radius and z-index vars", () => {
    expect(cssVars.radius.full).toBe("var(--radius-full)");
    expect(cssVars.z.modal).toBe("var(--z-modal)");
  });
});
