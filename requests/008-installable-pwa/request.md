# Request 008: Installable Android PWA

## Desired outcome

Make TKKGTracker installable on Android as a Progressive Web App (PWA), so Oliver can install it from the existing GitHub Pages website and launch it from an app icon in a standalone window rather than using a browser shortcut.

## Scope

- Preserve the existing tracker features and user experience: catalogue, search, filters, episode details, ratings, notes, progress import/export, and local storage must continue working as before.
- Keep the existing static React/Vite app and GitHub Pages hosting.
- Add a web app manifest, app icon, theme/display metadata, and service-worker registration.
- Provide offline resilience by caching the app shell and last successfully fetched catalogue, while fetching newer catalogue data when online.
- Keep the weekly scraper, validation, and deployment-after-success flow working. Decouple app-code deployment from scraper runs so an unrelated scraper failure cannot prevent a UI/PWA deployment.
- Preserve the existing `tkkgtracker-progress/v1` import/export format and local progress storage. No account, backend, or cloud synchronisation.
- Document Android installation and how to get updates if they are not immediately visible.

## Out of scope

- Google Play Store publication or a native Android package.
- Cloud sync, accounts, server-side storage, or changes to progress import/export.
- Reworking the UI or catalogue scraper.
- Guaranteeing that external episode links work offline; streaming services still require connectivity.

## Acceptance criteria

1. Android Chrome can install the HTTPS site as TKKGTracker and launch it in standalone display mode.
2. Manifest, icon, service worker, and asset URLs work under the `/TKKGtracker/` GitHub Pages base path.
3. After a successful online load, the app shell and last cached valid catalogue remain usable offline.
4. When online, the app requests the latest generated catalogue and can receive new app assets without requiring reinstall.
5. Existing features and interactions remain unchanged; local progress, ratings, and notes survive app installation and updates.
6. Export/import keeps the existing format and behaviour.
7. Weekly catalogue refresh still runs on schedule; a successful refresh deploys the new catalogue. App-code changes can deploy without depending on a successful scraper run.
8. Automated checks cover catalogue loading fallback and the normal frontend checks; manual instructions cover Android installation, online refresh, offline launch, and progress persistence.
9. Request notes report only checks actually performed and any remaining limitations.
