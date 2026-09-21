# UI Package

App-facing re-export layer for Nova's shared design system.

This package stays intentionally thin. It provides a stable import surface for applications while the design-system package owns the actual token and primitive implementations.

## Entry points

- `@nova/ui` — the application-facing component API: every `@nova/design-system` component plus the commerce, dashboard, layout and utility components. Applications import components from here and nowhere else (enforced by lint).
- `@nova/ui/charts` — `BarChart`, `LineChart`, `PieChart`. They depend on `recharts`, so they are not part of the root entry; importing `@nova/ui` never pulls `recharts` into a bundle.

The package declares `"sideEffects": false`. See `docs/frontend/05-design-system-usage.md`.
