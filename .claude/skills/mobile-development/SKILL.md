---
name: mobile-development
description: Mobile app engineering best practices - platform conventions, offline handling, performance, navigation. Load for iOS/Android/Flutter/React Native work.
---

# Mobile Development

## When to use this skill

- Building or modifying native or cross-platform mobile app features.

## Checklist / best practices

- Detect the existing mobile framework and navigation library before adding code.
- Respect platform UI conventions (Material for Android, Human Interface Guidelines for iOS) unless a design system overrides them.
- Design for offline/poor-connectivity states explicitly.
- Handle different screen sizes, safe areas, and orientation changes.
- Manage app/component lifecycle correctly (backgrounding, process death, configuration changes).
- Keep startup time and frame rate in mind for anything on a hot path (lists, animations).
- Handle permissions requests with clear rationale and graceful denial handling.

## Common pitfalls

- Assuming constant connectivity.
- Blocking the UI thread with heavy work.
- Porting web interaction patterns directly instead of native-feeling ones.
- Ignoring platform-specific back-navigation/gesture conventions.

## Standards & references

- Platform Human Interface / Material Design guidelines.
- Target frame budget (commonly 16ms/frame for 60fps) for anything animated or scrollable.
