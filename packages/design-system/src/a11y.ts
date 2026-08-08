/**
 * Nova Accessibility Utilities — WCAG 2.2 AA
 *
 * Covers: focus styles, color contrast, keyboard navigation,
 * reduced motion, and screen reader helpers.
 */

// ── Focus styles ──────────────────────────────────────────────────

/**
 * Standard focus-visible ring.
 * Apply via Tailwind: `focus-visible:ring-2 focus-visible:ring-[--color-border-focus]`
 * or use this object with inline styles / CSS-in-JS.
 */
export const focusRing = {
  outline: "2px solid var(--color-border-focus)",
  outlineOffset: "2px",
} as const;

/** Inset focus ring — for elements where outset ring clips (e.g. table cells). */
export const focusRingInset = {
  outline: "2px solid var(--color-border-focus)",
  outlineOffset: "-2px",
} as const;

/** CSS class string for Tailwind focus-visible ring. */
export const focusRingClass =
  "outline-none focus-visible:ring-2 focus-visible:ring-[--color-border-focus] focus-visible:ring-offset-2 focus-visible:ring-offset-[--color-background]";

/** Focus ring for dark surfaces (nav, footer). */
export const focusRingOnDarkClass =
  "outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

// ── Color contrast ────────────────────────────────────────────────

/**
 * WCAG 2.2 contrast ratio thresholds (1.4.3 Contrast (Minimum) — unchanged from 2.1).
 * AA normal text: 4.5:1 | AA large text / UI: 3:1 | AAA: 7:1
 */
export const contrastRatios = {
  aa: 4.5,
  aaLarge: 3.0,
  aaa: 7.0,
} as const;

/**
 * Relative luminance of an sRGB color (0–1).
 * @param hex — "#rrggbb" format
 */
export function relativeLuminance(hex: string): number {
  const rgb = hex
    .replace("#", "")
    .match(/.{2}/g)!
    .map((c) => {
      const v = parseInt(c, 16) / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

/**
 * WCAG contrast ratio between two hex colors.
 * @returns ratio — compare against contrastRatios.*
 */
export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Returns true if the fg/bg pair meets WCAG AA for normal text (4.5:1). */
export function meetsAA(fg: string, bg: string): boolean {
  return contrastRatio(fg, bg) >= contrastRatios.aa;
}

/** Returns true if the fg/bg pair meets WCAG AA for large text / UI (3:1). */
export function meetsAALarge(fg: string, bg: string): boolean {
  return contrastRatio(fg, bg) >= contrastRatios.aaLarge;
}

// ── Keyboard navigation ───────────────────────────────────────────

/** Keys used for keyboard navigation. */
export const Keys = {
  Enter: "Enter",
  Space: " ",
  Escape: "Escape",
  Tab: "Tab",
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
} as const;

export type Key = (typeof Keys)[keyof typeof Keys];

/** Returns true if the keyboard event is an activation key (Enter or Space). */
export function isActivationKey(e: KeyboardEvent | React.KeyboardEvent): boolean {
  return e.key === Keys.Enter || e.key === Keys.Space;
}

/** Trap focus within a container — returns cleanup function. */
export function trapFocus(container: HTMLElement): () => void {
  const focusable = container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function onKeyDown(e: KeyboardEvent) {
    if (e.key !== Keys.Tab) return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  container.addEventListener("keydown", onKeyDown);
  first?.focus();
  return () => container.removeEventListener("keydown", onKeyDown);
}

// ── Reduced motion ────────────────────────────────────────────────

/** Returns true if the user prefers reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Returns motion values respecting prefers-reduced-motion.
 * Pass full motion values; get instant/no-op values back if reduced.
 */
export function safeMotion<T extends Record<string, unknown>>(
  full: T,
  reduced: Partial<T> = {},
): T {
  if (prefersReducedMotion()) return { ...full, ...reduced, transition: { duration: 0 } };
  return full;
}

// ── Screen reader utilities ───────────────────────────────────────

/** Tailwind class to visually hide but keep accessible to screen readers. */
export const srOnly = "sr-only";

/** Tailwind class to undo sr-only (show on focus). */
export const srOnlyFocusable = "sr-only focus:not-sr-only focus:absolute focus:z-[--z-tooltip]";

/**
 * Props to add to a decorative element that should be hidden from screen readers.
 */
export const ariaHidden = { "aria-hidden": true as const };

/**
 * Generate aria-label props for icon-only buttons.
 * @example <button {...iconButton("Close menu")}><X /></button>
 */
export function iconButton(label: string) {
  return { "aria-label": label, type: "button" as const };
}

/**
 * Generate live region props for dynamic announcements.
 * @param politeness — "polite" for non-urgent, "assertive" for urgent
 */
export function liveRegion(politeness: "polite" | "assertive" = "polite") {
  return {
    role: "status" as const,
    "aria-live": politeness,
    "aria-atomic": true as const,
  };
}

// React import needed for KeyboardEvent type
import type React from "react";
