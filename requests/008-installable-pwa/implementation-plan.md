# Implementation plan: Installable Android PWA

**Status:** Approved; implementation is in progress on `request/008-installable-pwa`.

## 1. Establish the baseline

- Inspect the app entry point, Vite base path, generated catalogue, progress storage, tests, and GitHub Pages workflows.
- Preserve the existing browser-local progress storage and import/export contract.

## 2. Add installability metadata

- Add a web app manifest with the TKKGTracker name, standalone display mode, start URL and scope compatible with `/TKKGtracker/`, and the existing theme colour.
- Add an app icon and reference the manifest/icon from `index.html`.
- Register the service worker only in production and within the configured Vite base path.

## 3. Keep the catalogue current and support offline use

- Keep the existing bundled catalogue as an immediate fallback, but also request the generated `data/episodes.json` at app startup under `import.meta.env.BASE_URL`.
- Have the deployment workflow copy the canonical validated root `data/episodes.json` into `public/data/episodes.json` before building. Do not maintain a separate manually edited catalogue.
- Validate the fetched catalogue shape; if fetching fails or data is invalid, keep the bundled catalogue.
- Add a service worker that caches the app shell, uses network-first behaviour for navigation and catalogue JSON, and uses cached same-origin assets as offline fallback.
- Do not change progress storage or cache external streaming services.

## 4. Preserve and clarify automation

- Add a direct deploy trigger for app-code pushes to `main`, excluding generated data and documentation-only changes.
- Narrow the scraper's push trigger to scraper/schema/test/dependency changes. Keep the weekly schedule, manual trigger, validation, and deployment after a successful scheduled/manual catalogue refresh.
- This prevents a scraper failure on an unrelated app-code commit from blocking deployment while keeping data-only refresh commits on the existing successful-refresh deployment path.

## 5. Tests and documentation

- Add unit tests for catalogue shape validation, base-path URL, and fallback behaviour.
- Run `npm run typecheck`, `npm test`, `npm run build`, and repository CI where available.
- Document Android installation and manual tests for progress persistence, offline use, and catalogue updates.
- Record actual checks and remaining limitations in this request's notes.

## 6. Review and delivery

- Review paths, cache safety, workflow trigger interactions, and changes to progress handling.
- Open a focused pull request and wait for required checks.
- Verify the deployed site where access permits, then merge after implementation and review are complete.

## Main risks

- Incorrect paths can break installation or service-worker scope on GitHub Pages.
- A stale service worker can keep old assets active; navigation and catalogue requests therefore use network-first behaviour.
- Offline fallback only works after a successful online load has populated the cache.
- SVG app icon support can vary by browser/version; verify the install prompt and rendered icon on Android Chrome.
