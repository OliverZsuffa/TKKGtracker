# Implementation notes: Installable Android PWA

**Status:** Implemented on branch `request/008-installable-pwa`; awaiting automated CI and deployed/manual verification.

## Baseline and investigation

- The app is a static React/Vite site deployed on GitHub Pages with Vite base path `/TKKGtracker/`.
- The existing app imported `data/episodes.json` at build time and had no manifest or service-worker registration.
- Personal progress is stored in browser localStorage under `tkkgtracker.progress.v1`; exports use `tkkgtracker-progress/v1`. The PWA changes do not modify this contract.
- The catalogue workflow originally ran on most pushes, and deployment was coupled to its successful completion. The workflow triggers are narrowed so app-code changes deploy directly while data refreshes still deploy after a successful catalogue workflow.

## Implementation outcomes

- Added a manifest and TKKGTracker SVG app icon, standalone display metadata, and production service-worker registration under the GitHub Pages base path.
- Added a runtime catalogue request using `BASE_URL` and a validated bundled fallback. The deploy workflow copies the canonical generated `data/episodes.json` to the public runtime location before building.
- Added service-worker caching: network-first for page navigation and catalogue data; same-origin asset caching with offline fallback. External streaming URLs are not cached.
- Added unit tests for catalogue validation, base-path URL construction, and fallback behaviour.
- Added Android install instructions and reusable PWA deployment knowledge.
- Adjusted workflow triggers so app-code changes are not dependent on the scraper succeeding. The weekly schedule, manual scraper trigger, validation and deployment after a successful catalogue workflow remain configured.

## Checks actually run

- Inspected current app, storage, Vite base path, and workflow definitions.
- Added catalogue unit tests, but did not run them locally: the execution environment could not resolve `github.com` to clone the repository or install dependencies.
- GitHub Actions checks and live deployment have not yet been verified at the time of writing.

## Remaining work

- Confirm GitHub Actions passes and review any CI failures before merging.
- On Android Chrome, verify install prompt, standalone launch, icon, progress persistence, online catalogue refresh, and offline fallback.
- Confirm the deployed workflow has the runtime `data/episodes.json` file and the weekly refresh path still works.
- The icon is SVG; browser/version differences should be checked during the manual Android test.
