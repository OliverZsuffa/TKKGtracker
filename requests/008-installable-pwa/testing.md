# Manual testing: Installable Android PWA

Record actual observations after the implementation is deployed. Do not mark a test as passed without performing it.

## Automated checks

- [x] GitHub Actions frontend checks pass: dependency audit, typecheck, unit tests, production build.
- [ ] Confirm the build contains `manifest.webmanifest`, `service-worker.js`, the icon, and `data/episodes.json` under the GitHub Pages base path.
- [ ] Confirm the catalogue-refresh workflow retains its weekly schedule and successful refresh still triggers deployment.

## Android installation

- [ ] Open the deployed TKKGTracker site in Chrome on Android over HTTPS.
- [ ] Confirm Chrome offers **Install app** (or the equivalent install option in the browser menu).
- [ ] Install it and confirm an app icon appears in the launcher.
- [ ] Launch from the icon and confirm it opens in a standalone window without the normal browser address bar.
- [ ] Confirm the app name, icon, theme, and layout look correct.

## Progress preservation

- [ ] Mark an episode listened to, add a rating, and add a note.
- [ ] Close and reopen the installed app; confirm all three remain.
- [ ] Export progress and confirm the existing JSON format is unchanged.
- [ ] Import a previously exported file and confirm progress is restored correctly.

## Catalogue and offline behaviour

- [ ] While online, load the catalogue and confirm the expected episode count/search behaviour.
- [ ] Confirm a deployed catalogue update is picked up without reinstalling.
- [ ] After a successful online load, enable airplane mode and relaunch the app.
- [ ] Confirm the app shell and cached catalogue remain usable offline.
- [ ] Restore connectivity and confirm the catalogue can refresh again.
- [ ] Confirm external streaming links still require their own network access.

## Results

- Date/device/browser:
- App version/commit tested:
- Actual observations:
- Failures or limitations:
