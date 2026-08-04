# Nova Design System

Single source of truth for all Nova platform UI. Consumed by `apps/web`, `apps/seller`, and `apps/admin`.

---

## Installation

```ts
// In any app's tailwind.config.ts
import novaConfig from "@nova/tailwind-config";
export default { presets: [novaConfig] };

// In any app's root layout
import "@nova/design-system/css/variables.css";
```

---

## Brand Guidelines

### Brand Colors

| Name           | Hex       | Role                                        |
| -------------- | --------- | ------------------------------------------- |
| Primary Blue   | `#0D2A63` | Trust, navigation, headers, primary actions |
| Primary Orange | `#FF6A00` | CTAs, promotions, shopping actions          |
| Light Orange   | `#FFC8A3` | Soft surfaces, promotional backgrounds      |
| Accent Blue    | `#1A56DB` | Links, interactive elements                 |
| Neutral Dark   | `#111827` | Body text, dark surfaces, footer            |

Info (`#2563EB`, Semantic Palette) is a distinct color from Accent Blue — not
a duplicate. Accent Blue is for links/interactive elements; Info is its own
semantic role (see `bg-info` below). They render close in swatches but are
two separate tokens.

### Rules

- Never use raw hex values in component code. Always use semantic tokens.
- `primary` = Primary Blue. `accent` = Primary Orange. Never swap them.
- Orange is for **action** (buy, add to cart, CTA). Blue is for **trust** (nav, headers, brand).
- Light Orange is for **soft backgrounds** only — never for text or borders.

---

## Color Usage

### Semantic Token Map

```
bg-background          Page background
bg-surface             Cards, panels, sidebars
bg-surface-raised      Dropdowns, popovers, modals
bg-surface-nav         Navigation bar
bg-surface-footer      Footer

text-foreground        Primary body text
text-foreground-muted  Secondary / supporting text
text-foreground-subtle Placeholder, disabled, hint

border-border          Default borders, dividers
border-border-strong   Focused inputs, active states
border-border-focus    Focus ring color

bg-primary             Primary Blue — primary actions
bg-accent              Primary Orange — CTAs, promotions
bg-success             Confirmations, completed states
bg-warning             Caution, pending states
bg-error               Errors, destructive actions
bg-info                Informational, links
```

### Usage Examples

```tsx
// ✅ Correct — semantic tokens
<button className="bg-primary text-primary-foreground hover:bg-primary-hover">
  Buy Now
</button>

<div className="bg-surface border border-border rounded-lg shadow-sm">
  <p className="text-foreground-muted">Card content</p>
</div>

// ❌ Wrong — hardcoded colors
<button className="bg-[#0D2A63] text-white">Buy Now</button>
<div style={{ background: "#FF6A00" }}>CTA</div>
```

---

## Typography

### Font Stack

| Role             | Fonts                        |
| ---------------- | ---------------------------- |
| `--font-sans`    | Inter, system-ui, sans-serif |
| `--font-display` | Cal Sans, Inter, system-ui   |
| `--font-mono`    | IBM Plex Mono, ui-monospace  |

### Type Scale

Matches the Phase 2 Enterprise Design System spec exactly (Section 2).
`label`/`overline` are retained beyond the source spec — form labels, table
headers, and eyebrow text need a role and the spec doesn't define one.

| Role        | Size / Line-height | Weight | Use                               |
| ----------- | ------------------ | ------ | --------------------------------- |
| `display1`  | 60px / 72px        | 800    | Hero banners, marketing splash    |
| `display2`  | 48px / 56px        | 800    | Secondary hero / large intro      |
| `heading1`  | 36px / 44px        | 700    | Page titles                       |
| `heading2`  | 30px / 36px        | 700    | Section headings                  |
| `heading3`  | 24px / 32px        | 600    | Sub-section headings              |
| `heading4`  | 20px / 28px        | 600    | Card / panel headings             |
| `bodyLarge` | 18px / 28px        | 400    | Lead paragraphs                   |
| `bodyBase`  | 16px / 24px        | 400    | Default body copy                 |
| `bodySmall` | 14px / 20px        | 400    | Secondary body, helper text       |
| `caption`   | 12px / 16px        | 400    | Timestamps, metadata              |
| `label`     | 14px               | 600    | Form labels, table headers        |
| `overline`  | 11px               | 700    | Category eyebrow text (uppercase) |

### Text Components

Use the semantic text components, not raw Tailwind size classes, for
anything in this scale — they read `typography.scale` directly, so there's
one source of truth for font-size / line-height / weight / letter-spacing.

```tsx
import { Heading1, BodyBase, Caption } from "@nova/design-system";

<Heading1>Page title</Heading1>
<BodyBase>Default body copy.</BodyBase>
<Caption>Posted 2 hours ago</Caption>

// Override the rendered element when the default (heading1 -> <h1>, etc.) isn't right
<Heading1 as="span">Styled like heading1, renders as a span</Heading1>
```

Full set: `Display1`, `Display2`, `Heading1`–`Heading4`, `BodyLarge`,
`BodyBase`, `BodySmall`, `Caption`, `Label`, `Overline` — or the generic
`<Text variant="...">` when the role is dynamic.

---

## Spacing

8px base grid. Use semantic aliases in components — never raw pixel values.

| Alias        | Value     | px  |
| ------------ | --------- | --- |
| `space.none` | `0rem`    | 0   |
| `space.xs`   | `0.5rem`  | 8   |
| `space.sm`   | `0.75rem` | 12  |
| `space.md`   | `1rem`    | 16  |
| `space.lg`   | `1.5rem`  | 24  |
| `space.xl`   | `2rem`    | 32  |
| `space.2xl`  | `2.5rem`  | 40  |
| `space.3xl`  | `3rem`    | 48  |
| `space.4xl`  | `4rem`    | 64  |
| `space.5xl`  | `5rem`    | 80  |
| `space.6xl`  | `6rem`    | 96  |

```tsx
// Tailwind spacing maps directly to the scale
<div className="p-4 gap-6 mt-8">   {/* 16px / 24px / 32px */}
<div className="px-6 py-4">        {/* 24px / 16px */}
```

---

## Border Radius

9-step scale, matches the Phase 2 spec exactly (Section 6). Note the values
shifted from the prior scale — e.g. `rounded-lg` is now 8px, not 12px — since
a step was inserted (`xs`, 2px) below and another (`md`, 6px) in the middle.

| Token          | Value  | Use                     |
| -------------- | ------ | ----------------------- |
| `rounded-none` | 0      | Sharp corners           |
| `rounded-xs`   | 2px    | Hairline corners        |
| `rounded-sm`   | 4px    | Tags, badges            |
| `rounded-md`   | 6px    | —                       |
| `rounded-lg`   | 8px    | Inputs, buttons         |
| `rounded-xl`   | 12px   | Cards                   |
| `rounded-2xl`  | 16px   | Modals, panels          |
| `rounded-3xl`  | 24px   | Large cards, sheets     |
| `rounded-full` | 9999px | Avatars, chips, toggles |

---

## Shadows / Elevation

Black-tinted (`rgba(0,0,0,*)`), matching the Phase 2 spec exactly (Section 7)
— the prior scale used a deliberate navy tint (`rgba(0,42,99,*)`); this is a
visible change, not just a value update.

| Token          | Use                                  |
| -------------- | ------------------------------------ |
| `shadow-xs`    | Subtle lift — table rows, list items |
| `shadow-sm`    | Cards, focused inputs                |
| `shadow-md`    | Dropdowns, popovers                  |
| `shadow-lg`    | Modals, drawers                      |
| `shadow-xl`    | Floating buttons, sticky headers     |
| `shadow-2xl`   | Full-page overlays, command palette  |
| `shadow-inner` | Inset — pressed states, wells        |

Dark mode shadows are automatically applied via `.dark` CSS class — no extra work needed.

---

## Motion

### Durations

| Token           | Value  | Use                        |
| --------------- | ------ | -------------------------- |
| `duration-75`   | 75ms   | Instant feedback, tooltips |
| `duration-100`  | 100ms  | Hover states               |
| `duration-200`  | 200ms  | Standard transitions       |
| `duration-300`  | 300ms  | Modals, drawers            |
| `duration-500`  | 500ms  | Page transitions           |
| `duration-700`  | 700ms  | Loading spinners           |
| `duration-1000` | 1000ms | Skeleton shimmer           |

### Easings

| Token         | Value                           | Use                         |
| ------------- | ------------------------------- | --------------------------- |
| `ease`        | `ease`                          | General                     |
| `ease-in`     | `ease-in`                       | Exits                       |
| `ease-out`    | `ease-out`                      | Entrances                   |
| `ease-in-out` | `ease-in-out`                   | Toggles                     |
| `spring`      | `cubic-bezier(0.16, 1, 0.3, 1)` | Energetic entrances, modals |

```tsx
// Tailwind
<div className="transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5">

// Framer Motion
import { motion } from "@nova/design-system";
<motion.div variants={motion.presets.modal} initial="initial" animate="animate" exit="exit">
```

---

## Responsive System

| Breakpoint | Min-width | Container |
| ---------- | --------- | --------- |
| `sm`       | 640px     | 640px     |
| `md`       | 768px     | 768px     |
| `lg`       | 1024px    | 1024px    |
| `xl`       | 1280px    | 1280px    |
| `2xl`      | 1536px    | 1536px    |

```tsx
<div className="px-4 sm:px-6 lg:px-8">          {/* responsive padding */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
<div className="max-w-xl mx-auto">               {/* prose width */}
```

---

## Icon System

Uses Lucide React. Import from `@nova/icons`.

```tsx
import { ShoppingCart, Heart, Star } from "@nova/icons";
import { iconSizes, iconStrokes } from "@nova/icons";

// Standard sizes: 12 | 16 | 20 (default) | 24 | 32 | 48
// Standard strokes: 1 | 1.5 (default) | 2

<ShoppingCart size={iconSizes.md} strokeWidth={iconStrokes.regular} />
<Heart size={24} strokeWidth={2} className="text-error" />
```

---

## Component Guidelines

### Button

```tsx
// Primary — Nova Primary Blue, main CTA
<button className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-md px-4 py-2 font-semibold transition-colors duration-100">

// Accent — Nova Orange, shopping actions
<button className="bg-accent text-accent-foreground hover:bg-accent-hover rounded-md px-4 py-2 font-semibold transition-colors duration-100">

// Secondary — subtle
<button className="bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-secondary-border rounded-md px-4 py-2 font-semibold">

// Ghost
<button className="text-foreground hover:bg-muted rounded-md px-4 py-2 font-semibold transition-colors duration-100">
```

### Card

```tsx
<div className="bg-surface border border-border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
```

### Input

```tsx
<input className="bg-background border-border-input text-foreground placeholder:text-foreground-subtle focus:ring-border-focus focus:border-border-focus w-full rounded-md border px-3 py-2 transition-colors duration-100 focus:outline-none focus:ring-2" />
```

### Navigation

```tsx
<nav className="bg-surface-nav text-foreground-on-dark">
  <a className="hover:text-accent transition-colors duration-100 focus-visible:ring-2 focus-visible:ring-white">
```

---

## Accessibility Rules

### WCAG 2.1 AA Requirements

1. **Color contrast** — All text must meet 4.5:1 (normal) or 3:1 (large/UI). Use `contrastRatio()` from `@nova/design-system` to verify.
2. **Focus states** — Every interactive element must have a visible focus ring. Use `focusRingClass` or Tailwind `focus-visible:ring-2 focus-visible:ring-border-focus`.
3. **Keyboard navigation** — All interactive elements reachable and operable via keyboard. Use `trapFocus()` for modals.
4. **Reduced motion** — All animations must respect `prefers-reduced-motion`. Use `safeMotion()` wrapper.
5. **Screen readers** — Icon-only buttons must have `aria-label`. Decorative images use `aria-hidden`. Dynamic content uses `aria-live`.

```tsx
import { focusRingClass, iconButton, liveRegion, safeMotion } from "@nova/design-system";

// Icon-only button
<button {...iconButton("Close menu")} className={focusRingClass}><X /></button>

// Live region for toasts
<div {...liveRegion("polite")}>{message}</div>

// Motion respecting reduced motion
const variants = safeMotion(motion.presets.modal);
```

---

## Theme System

### Runtime Theme Switching

```tsx
// Root layout
import { ThemeProvider } from "@nova/design-system";

<ThemeProvider defaultTheme="light">
  <App />
</ThemeProvider>;

// Toggle
const { setTheme } = useTheme();
setTheme("dark");
```

### Custom Themes (Seller / Campaign / Regional)

```tsx
import { createTheme, ThemeProvider } from "@nova/design-system";

const ramadanTheme = createTheme({
  primary: "#7c3aed",
  primaryHover: "#6d28d9",
  accent: "#f59e0b",
});

<ThemeProvider defaultTheme="light" overrides={ramadanTheme}>
  <SellerStorefront />
</ThemeProvider>;
```

### CSS Variable Override (no React)

```css
/* Seller brand override */
[data-seller="acme"] {
  --color-primary: #7c3aed;
  --color-primary-hover: #6d28d9;
  --color-accent: #f59e0b;
  --nova-primary: var(--color-primary);
  --nova-orange: var(--color-accent);
}
```

---

## Developer Usage

### Consuming Tokens in TypeScript

```ts
import {
  colors,       // primitive palette scales
  typography,   // type scale + font families
  spacing,      // 8px grid values
  space,        // semantic spacing aliases
  radius,       // border radius scale
  shadows,      // elevation scale
  shadowsDark,  // dark-mode elevation
  motion,       // durations, easings, Framer presets
  breakpoints,  // responsive breakpoints
  containerWidths,
  zIndex,
  themes,       // { light, dark }
  createTheme,  // custom theme factory
  cssVars,      // typed CSS var reference map
} from "@nova/design-system";

// Type-safe CSS var reference
style={{ color: cssVars.color.primary }}  // → "var(--color-primary)"
style={{ boxShadow: cssVars.shadow.md }}  // → "var(--shadow-md)"
```

### Engineering Rules

1. **Single source of truth** — All tokens live in `packages/design-system/src/tokens/`. Never define colors, spacing, or radius elsewhere.
2. **No duplicated tokens** — Root-level files (`colors.ts`, `spacing.ts`, etc.) are thin re-exports of `tokens/*`. Never add values to them.
3. **No hardcoded brand colors** — `#0D2A63`, `#FF6A00`, etc. must never appear in component code. Use `bg-primary`, `bg-accent`, or `cssVars.color.primary`.
4. **No arbitrary Tailwind values** — `bg-[#0D2A63]` is forbidden. If a value isn't in the token system, add it to the token system first.
5. **Semantic naming** — Use role names (`primary`, `accent`, `error`) not color names (`navy`, `orange`, `red`) in components.
6. **Type-safe tokens** — All tokens are `as const`. Use exported types (`RadiusKey`, `ShadowKey`, `MotionPreset`, etc.) for props.
7. **Documentation-first** — Every new token must be documented in this README before being used in a component.

---

## Export Reference

```ts
// @nova/design-system
export {
  // Tokens
  colors,
  typography,
  spacing,
  space,
  radius,
  shadows,
  shadowsDark,
  motion,
  breakpoints,
  containerWidths,
  containerPadding,
  grid,
  sectionSpacing,
  zIndex,

  // Themes
  themes,
  lightTheme,
  darkTheme,
  createTheme,
  ThemeProvider,
  useTheme,

  // CSS vars reference
  cssVars,

  // Accessibility
  focusRing,
  focusRingClass,
  focusRingOnDarkClass,
  contrastRatio,
  meetsAA,
  meetsAALarge,
  Keys,
  isActivationKey,
  trapFocus,
  prefersReducedMotion,
  safeMotion,
  srOnly,
  srOnlyFocusable,
  ariaHidden,
  iconButton,
  liveRegion,
};

// @nova/icons
export { /* all Lucide icons */ iconSizes, iconStrokes };

// @nova/tailwind-config
export default config; // extends with all Nova tokens
```
