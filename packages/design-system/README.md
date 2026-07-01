# Design System Package

Nova's token-driven design language, component primitives, theming, and accessibility foundations.

## Purpose

This package owns the visual and interaction foundation for every Nova application. The `ui` package consumes these primitives and re-exports the app-facing surface.

## Architecture

- `src/tokens.ts`: raw primitive scales for spacing, radius, motion, elevation, breakpoints, and z-index.
- `src/themes.ts`: semantic color contracts for light, dark, and high-contrast themes.
- `src/typography.ts`: responsive type scale and text roles.
- `src/components/*`: accessible primitives used by application teams.
- `src/icons.ts`: shared Lucide icon exports.

## Standards

- Tokens are the only source for color, spacing, radius, and motion values.
- Components must expose TypeScript props, accessible defaults, and variant hooks.
- Hardcoded visual constants should not be introduced in app code when a token exists.
