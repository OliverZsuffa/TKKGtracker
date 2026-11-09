# PWA deployment and offline catalogue

## GitHub Pages paths

- The production app is deployed below /TKKGtracker/, not the domain root. Use Vite's import.meta.env.BASE_URL for app-side URLs and derive the service worker's base from self.registration.scope.
- The manifest's start URL and scope are relative to the manifest location so they remain inside the GitHub Pages project path.
- The deployment workflow synchronizes the latest validated TKKGData dataset into data/episodes.json, then copies it into public/data/episodes.json before the Vite build.
- The app's runtime catalogue URL remains same-origin at data/episodes.json. Do not change it to a cross-origin raw GitHub URL.

## Catalogue loading and offline fallback

- The app begins with the catalogue bundled into the Vite JavaScript as a fallback, then requests data/episodes.json under BASE_URL on startup.
- Runtime catalogue responses are accepted only when they are a non-empty array with integer episode numbers and string titles. Failed or invalid responses leave the bundled catalogue in use.
- The service worker uses network-first retrieval for navigations and the runtime catalogue JSON, saving successful responses and falling back to cached copies when offline. Other same-origin GET assets use cache-first with network fill.
- Keep external streaming URLs outside service-worker caching and do not change the local progress storage or import/export schema as part of PWA work.
- TKKGData performs source scraping and publishes the canonical data. TKKGTracker's deployment fetches that dataset at build time. A weekly scheduled deployment refreshes the deployed app after the TKKGData refresh schedules.
- The migration intentionally leaves src/App.tsx, src/catalogue.ts, src/storage.ts, public/service-worker.js, and UI styling unchanged.
