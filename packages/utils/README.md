# Utils Package

Pure, dependency-light platform utilities with no React or app-specific assumptions — safe to import from any app or package. Public API: `cn(...inputs)` merges Tailwind class names (via `clsx` + `tailwind-merge`), resolving conflicting utility classes deterministically; `formatMoney(money: Money)` formats a `@nova/types` `Money` value for display (e.g. `NLe 1,400.00`, `$79.99`) and is the only place currency-symbol/locale formatting logic should live — components should call this rather than hand-rolling their own money formatting.
