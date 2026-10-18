# Implementation plan: Installable Android PWA

**Status:** Proposed; awaiting Oliver's explicit approval. No application code changes are authorised yet.

## 1. Establish the baseline

- Inspect current app entry point, Vite base path, public asset conventions, catalogue fetch path, progress storage, tests, and GitHub Pages deployment workflow.
- Read the existing progress-storage knowledge and current deployment notes.
- Record current test/build baseline where the available environment permits.

## 2. Add installability metadata

- Add a web app manifest with a clear app name, short name, standalone display mode, start URL and scope compatible with the `/TKKGtracker/` GitHub Pages base path, and the existing theme colour.
- Add correctly sized app icons suitable for Android installation and reference them from the manifest.
- Add the manifest link and mobile-capable metadata to `index.html`.

## 3. Add conservative offline support

- Add a small service worker and register it from the existing React entry point.
- Cache versioned build assets/app shell and clean up only this app's obsolete caches.
- Handle the catalogue JSON separately: use a network-first strategy and update the cached copy only after a successful response; use the last cached valid response as the offline fallback.
- Avoid caching or modifying personal progress as part of service-worker logic. Keep localStorage and import/export behaviour unchanged.
- Ensure all paths respect Vite's GitHub Pages base path and that new deployments can update the service worker/cache without requiring reinstall.

## 4. Tests and documentation

- Add tests for any extracted, testable cache/version/path logic where practical; do not pretend a simulated unit test proves Android installation.
- Run Python tests only if relevant, plus `npm run typecheck`, `npm test`, `npm run build`, and the repository's normal CI checks when available.
- Update this request's `testing.md` and `notes.md` with actual results and limitations.
- Update existing knowledge only if implementation establishes a reusable fact about PWA deployment or cache behaviour.

## 5. Review and delivery

- Review the complete diff for path correctness, cache safety, and accidental progress-data changes.
- Open a focused pull request, wait for required checks, and manually verify the deployed site where access permits.
- Following the repository workflow, merge after implementation and review are complete without requiring another merge instruction.

## Main risks

- Incorrect root-relative paths can break installation or the service worker on GitHub Pages.
- A stale service worker can keep old app code active if update handling is careless.
- Caching the catalogue incorrectly could prevent new weekly data from appearing. Network-first catalogue retrieval and explicit offline fallback are intended to mitigate this.
- Browser/PWA storage is local to the installed browser context and is not a sync mechanism. Users should retain the existing export file as a backup.
