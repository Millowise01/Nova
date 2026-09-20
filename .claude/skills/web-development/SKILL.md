---
name: web-development
description: Frontend and full-stack web best practices - component design, state management, performance, responsive design. Load for web UI or full-stack web feature work.
---

# Web Development

## When to use this skill

- Building or modifying a web UI, a full-stack web feature, or web-facing API integration.

## Checklist / best practices

- Detect the existing framework/rendering strategy before adding code.
- Design components around a single responsibility with clear props/inputs.
- Handle loading, empty, error, and success states explicitly.
- Keep layout responsive across the breakpoints the project supports.
- Use the project's existing state-management approach rather than adding a new one.
- Debounce/throttle expensive operations triggered by user input.
- Validate and sanitize any user input before it reaches the backend.
- Check bundle-size impact of new dependencies.

## Common pitfalls

- Blocking the main thread with heavy synchronous work.
- Ignoring accessibility (keyboard/focus/contrast) until a later pass.
- Fetching data without handling the request failing.
- Introducing a second state-management library alongside an existing one.

## Standards & references

- Core Web Vitals (LCP, INP, CLS) as the baseline performance bar.
- WCAG 2.1 AA as the baseline accessibility bar.
