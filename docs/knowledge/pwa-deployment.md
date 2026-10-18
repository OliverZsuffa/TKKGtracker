# PWA deployment and offline catalogue

## GitHub Pages paths

- The production app is deployed below `/TKKGtracker/`, not the domain root. Use Vite's `import.meta.env.BASE_URL` for app-side URLs and derive the service worker's base from `self.registration.scope`.
- The manifest's start URL and scope are relative to the manifest location so they remain inside the GitHub Pages project path.
- The deploy workflow copies the canonical generated `data/episodes.json` into `public/data/episodes.json` immediately before the Vite build. The runtime JSON is therefore generated from the same validated source as the bundled fallback; do not maintain a separate manually edited catalogue copy.

## Catalogue loading and offline fallback

- The app begins with the catalogue bundled into the Vite JavaScript as a fallback, then requests `data/episodes.json` under `BASE_URL` on startup.
- Runtime catalogue responses are accepted only when they are a non-empty array with integer episode numbers and string titles. Failed or invalid responses leave the bundled catalogue in use.
- The service worker uses network-first retrieval for navigations and the runtime catalogue JSON, saving successful responses and falling back to cached copies when offline. Other same-origin GET assets use cache-first with network fill.
- Keep external streaming URLs outside service-worker caching and do not change the local progress storage or import/export schema as part of PWA work.
- A successful weekly catalogue refresh still triggers the deploy workflow through the existing `workflow_run` event. App-code pushes also deploy directly; data-only bot commits are ignored by the direct push trigger and deploy after a successful catalogue workflow.
