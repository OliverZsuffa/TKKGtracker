# Implementation notes: Installable Android PWA

**Status:** Proposed; implementation has not started.

## Baseline and investigation

- The app is a static React/Vite site deployed on GitHub Pages with Vite base path `/TKKGtracker/`.
- The app entry point is `src/main.tsx`; `index.html` currently has a theme colour and description but no manifest link.
- Personal progress is stored in browser localStorage under `tkkgtracker.progress.v1`; exports use `tkkgtracker-progress/v1`. These contracts must remain unchanged.
- No service-worker registration or PWA manifest was found in the inspected files.

## Implementation outcomes

Pending approval and implementation.

## Checks actually run

- Repository files and existing project instructions/knowledge were inspected.
- No application tests or production build were run during planning.

## Remaining work

- Await explicit approval of `implementation-plan.md`.
