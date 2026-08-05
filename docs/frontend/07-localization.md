# Localization

Source: Nova Enterprise Blueprint, **Volume 6, Part E4** (i18n setup, "launching in English with Krio support"), **Volume 1, Part C3** (expansion plan — "content localization for English, Krio, and future regional languages... without restructuring"), cross-referenced with the actual `next-intl` implementation in `apps/web`.

## A discrepancy, flagged plainly rather than silently resolved either way

Vol 6, E4 and Vol 1, C3 both name the same launch languages: **English + Krio.** The actual, currently-implemented locale set in `apps/web/src/config/app.ts` is different:

```typescript
export const LOCALES = ["en", "fr", "ar"] as const;
export const DEFAULT_LOCALE: Locale = "en";
export const RTL_LOCALES: Locale[] = ["ar"];
```

Krio is not implemented; French and Arabic are, with a full `messages/{en,fr,ar}.json` catalog and RTL handling wired specifically for Arabic. This diverges from what both blueprint volumes actually say.

**I'm not treating this as settled either way.** My own working context from earlier in this project suggests this may already have been a deliberate call — but I don't have a durable, file-based record of that decision to point to (nothing in this repo's saved project memory documents it), and the task's own ground rules are explicit that a recalled conversation summary isn't a substitute for verifying against an actual source. So: the code says en/fr/ar, the blueprint says English+Krio, and this doc surfaces that gap in the confirmation list at the end rather than quietly picking a side. Whatever you confirm, I'll write it down properly this time so it doesn't need re-discovering again.

## Where translation strings live (as implemented)

```text
apps/web/src/
  i18n/request.ts          # next-intl server config — loads the message file for the active locale
  messages/
    en.json
    fr.json
    ar.json
```

`i18n/request.ts` resolves the active locale (falling back to `en` if the requested locale isn't in the supported set) and dynamically imports the matching JSON file. Adding a new locale, mechanically, means: add it to `LOCALES` in `config/app.ts`, add a new `messages/<locale>.json` with every key the other files have, and add it to the `locales` array in `i18n/request.ts` (currently duplicated as a separate literal array there — worth consolidating to import from `config/app.ts` instead of maintaining two lists that could drift, though that's a small cleanup, not a blocking issue).

## Key naming convention (as implemented — not invented)

Nested namespaces by feature/area, `camelCase` leaf keys:

```json
{
  "common": { "appName": "Nova", "loading": "Loading...", "retry": "Retry" },
  "navigation": { "searchPlaceholder": "...", "searchAriaLabel": "...", "skipToContent": "..." },
  "footer": { "tagline": "...", "shop": "...", "helpCenter": "..." },
  "errors": { "somethingWentWrong": "...", "pageNotFound": "...", "forbidden": "..." }
}
```

Top-level keys are the feature or chrome area (`navigation`, `footer`, `errors`, `dashboard`); leaf keys describe the specific string's role, not its literal English content (`searchPlaceholder`, not `"Search products, sellers, categories"` as the key). A component accesses its namespace via `useTranslations("navigation")` then calls `t("searchPlaceholder")` — this is the existing, correct pattern in `main-header.tsx` and the other 7 files that already use `next-intl`.

## How a component declares user-facing text — the rule vs. the current reality

**The rule (hard constraint, consistent with "no hardcoded design tokens" being a hard constraint elsewhere in this doc set):** a component never has a literal user-facing English string in its JSX. Every piece of copy comes from `useTranslations()` (client components) or `getTranslations()` (server components), reading from the message catalog.

**The current reality, verified directly, not assumed:** this rule is honored in exactly 8 files — the error pages, the root layout, and the navigation chrome (header, footer, announcement bar). Everywhere else — every feature component reviewed while researching this doc set (`newsletter-section.tsx`'s "Stay ahead of every deal," `recommendations-section.tsx`'s "AI Recommendations," `search-screen.tsx`'s entire module description list, `checkout-flow.tsx`'s step labels and button text) — has hardcoded English strings. This isn't a hypothetical risk to guard against; it's the current, majority state of the app's actual copy.

This matters beyond "it'll need translating eventually": `next-intl`'s RTL handling (the `dir="rtl"` attribute set at the `<html>` level for Arabic, and the `x-nova-dir` header the middleware injects) only changes text _direction_ — it does nothing for text that was never routed through the translation system in the first place. A hardcoded English string in a checkout button doesn't become Arabic (or Krio) just because the page around it flipped to RTL; it stays English, sitting inside an RTL-flowing layout, which reads as more broken than an untranslated LTR page would.

## Scaling to future regional languages (Vol 1, C3)

> "...structured so additional languages can be added per the regional expansion plan in Volume 1, Part C3 without restructuring the underlying components — consistent with the country-configurable principle established across Volumes 1, 2, and 5."

The current architecture already satisfies this, mechanically — adding a language is the three-step mechanical process described above (new locale entry, new message file, no component changes required), because every already-migrated component reads copy by key, not by hardcoded string. **The risk to this property isn't the i18n architecture — it's the 8-vs-everything-else gap above.** Every hardcoded string left in a component today is a string that will need to be _found and migrated_ later, one at a time, rather than a language that can be added by dropping in one new JSON file. The more hardcoded strings accumulate before this gets fixed, the more expensive the eventual migration becomes — this is a compounding-debt risk, not a static one.

Vol 1, C3's expansion phases (Sierra Leone → Liberia/Guinea → Ghana/Nigeria → broader Africa) imply French becomes genuinely relevant at Phase 2/3 (Guinea is Francophone) even though it's not one of the blueprint's stated _launch_ languages — so the current `fr` locale isn't necessarily wasted work regardless of how the Krio-vs-French question above is resolved; it may just be sequenced earlier than the blueprint's own phasing calls for.

## Known risks in this area for Nova specifically

- **The en/fr/ar vs. English+Krio discrepancy above** — the single most consequential open item in this entire doc set, since it affects which language files actually need to be written and by whom, not just an internal engineering convention.
- **The hardcoded-string majority.** 8 files compliant, an unknown-but-larger number not — this is a real, current, and growing gap, not a risk to merely watch for.
- **`i18n/request.ts` and `config/app.ts` maintaining two separate `locales` arrays.** Small today (3 entries each), but exactly the kind of two-sources-of-truth pattern that causes a silent bug the day someone updates one and not the other.
- **RTL support existing for Arabic specifically** — if Arabic is dropped in favor of Krio (which is not RTL), the RTL-handling code (`RTL_LOCALES`, the `x-nova-dir` header, the `dir` attribute logic) becomes dead code that should be removed, not left in place "in case it's needed later" without a concrete plan for when that would be.
