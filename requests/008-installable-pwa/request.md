# Request 008: Installable Android PWA

## Desired outcome

Make TKKGTracker installable on Android as a Progressive Web App (PWA), so Oliver can install it from the existing GitHub Pages website and launch it from an app icon in a standalone window rather than using a browser shortcut.

## Scope

- Keep the existing static React/Vite app and GitHub Pages hosting.
- Add the web app manifest, suitable app icons, theme/display metadata, and service-worker registration required for installation.
- Provide basic offline resilience: cache the built app shell and the last successfully fetched catalogue, while allowing a newer catalogue to be fetched when online.
- Preserve the existing browser-local progress storage and the current `tkkgtracker-progress/v1` import/export format. No account, backend, or cloud synchronisation.
- Document Android installation and how to refresh the app if an update is not immediately visible.

## Out of scope

- Google Play Store publication or a native Android package.
- Cloud sync, accounts, server-side storage, or changes to progress import/export.
- Reworking the UI or catalogue scraper.
- Guaranteeing that every external episode link works offline; external streaming services still require connectivity.

## Acceptance criteria

1. On the deployed HTTPS site, Android Chrome offers an install option and the installed app launches in standalone display mode with TKKGTracker branding.
2. The manifest uses the correct GitHub Pages base path and valid icons.
3. App assets and the last cached valid catalogue can be used when offline after the app has loaded successfully online at least once.
4. When online, the app can receive updated app assets and catalogue data without requiring a reinstall.
5. Local listening progress, ratings, and notes remain intact across installation and app updates; export/import remains compatible.
6. Automated checks cover the new registration/configuration where practical, and manual testing instructions cover Android installation, online refresh, offline launch, and progress persistence.
7. The request documents record only checks actually performed and any remaining limitations.
