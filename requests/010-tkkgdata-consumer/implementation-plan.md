# Implementation plan: Make TKKGTracker a TKKGData consumer

**Status:** Approved by Oliver on 2026-11-09. Implementation in progress. Strict no-functionality-change constraint.

## 1. Preconditions
1. Read TKKGData request 001 and the approved schema and consumer documentation.
2. Confirm the stable latest dataset URL and immutable versioned snapshot URL.
3. Confirm schema versioning, required fields, episode IDs, series scope, and optional metadata semantics.
4. Confirm CORS and caching behaviour from the actual published endpoint.
5. Record the current tracker main commit, catalogue count, app build status, and progress-storage format.
6. Do not start the app cutover until TKKGData has a validated initial publication.

## 2. Consumer boundary
After migration, TKKGTracker owns:
- Web application and episode presentation.
- Search, filters, and user-facing catalogue interactions.
- Local listening progress, ratings, notes, favourites, and settings.
- Progress export/import and profile handling.
- PWA installation, service worker, offline app shell, and cached catalogue fallback.

TKKGTracker does not own:
- Source scraping or source adapters.
- Episode metadata normalization or reconciliation.
- Dataset schema or authoritative generated episode records.
- Spotify or YouTube Music discovery and matching.
- Shared catalogue publication or source coverage reporting.

## 3. Baseline audit
1. Search the entire repository for reads of data/episodes.json, data/episodes.csv, schema fields, and scraper-generated assets.
2. Identify fields consumed by app components, tests, build scripts, service worker, and deployment workflow.
3. Map each consumed field to the TKKGData contract.
4. Identify fields that are app-only and keep them separate from the shared data.
5. Record the current local progress schema and ensure episode IDs can be mapped without losing data.
6. Audit request 009, its feature branch, draft PR #14, audio enrichment scripts, and workflows. Identify code and fixtures to migrate to TKKGData. Do not merge PR #14 into TKKGTracker.

## 4. Build-time dataset integration
1. Keep the existing app-facing data/episodes.json path and the existing Episode array shape.
2. Add a Node-only sync script that fetches TKKGData data/episodes.json and data/dataset-metadata.json during deployment and on explicit local sync.
3. Validate schema version 1.x, metadata episode count, non-empty dataset, unique contiguous episode numbers, titles, and every array field currently consumed by the UI.
4. Write the downloaded JSON to the existing data/episodes.json build input only after both remote files have been fetched and validated completely.
5. Keep the existing local data/episodes.json as a last-known-good development fallback if the sync command is not run.
6. Continue copying data/episodes.json into public/data/episodes.json during deployment. The app therefore continues fetching the catalogue from the same origin and same URL as before.
7. Do not change src/App.tsx, src/catalogue.ts, src/types.ts, src/storage.ts, public/service-worker.js, or UI styling as part of this migration.
8. This build-time approach avoids runtime CORS dependencies and preserves the current service-worker cache behaviour. No remote data client or new browser cache is introduced.

## 5. Preserve user data
1. Keep progress storage separate from the remote dataset.
2. Map existing progress by stable episode ID. If the new schema uses a different ID, implement an explicit, tested migration mapping.
3. Preserve ratings, notes, favourites, settings, and export/import formats.
4. Do not upload user progress or personal notes to TKKGData.
5. Test migration using a copy of a realistic existing local progress export.

## 6. Remove data maintenance responsibilities
Only after the runtime client is proven:
- Remove the Python source scraper and scraper-only dependencies.
- Remove source adapters, source discovery, and audio enrichment code.
- Remove the episode schema and generated CSV/report from this repository after the TKKGData deployment build is proven.
- Remove weekly catalogue scraping and audio enrichment workflows.
- Remove documentation that says TKKGTracker owns or publishes the catalogue.
- Retain data/episodes.json as the app's local last-known-good build fallback and import input. It is not maintained or scraped here and is refreshed from TKKGData for deployment.
- Retain app-specific fixtures only when clearly marked as test fixtures and not treated as a live catalogue.
- Preserve relevant source findings by migrating them into TKKGData's knowledge base and request notes.

Do not delete files merely because they appear unused. Verify references and build output first.

## 7. PWA and deployment
1. Fetch and validate the latest TKKGData JSON and metadata on the GitHub Actions runner before building the app.
2. Copy the validated catalogue into the existing public/data/episodes.json runtime location.
3. Keep the existing same-origin URL, service worker, cache name, navigation handling, and cache-first or network-first behaviour unchanged.
4. Keep the catalogue embedded in the app bundle as the initial fallback, exactly as today.
5. Schedule a weekly tracker deployment after the TKKGData catalogue and audio enrichment schedules.
6. Confirm a newly published dataset becomes visible after the next deployment and app refresh, without reinstalling the PWA.
7. Ensure deployment no longer runs a local scraper.

## 8. Tests
Automated:
- Valid dataset accepted.
- Unsupported schema version rejected.
- Missing required fields rejected.
- Malformed episode record rejected.
- Network error retains last-known-good data.
- Invalid response does not replace cache.
- Stable IDs preserve progress associations.
- Optional metadata absent without rendering failure.
- No remaining production code imports or runs the scraper.
- Existing progress import/export tests continue to pass.

Manual:
- Load the app online.
- Refresh after a new dataset version is published.
- Disable network and relaunch the installed PWA.
- Confirm progress, ratings, notes, favourites, and settings remain intact.
- Confirm the app still works with episodes missing optional source metadata.
- Verify deployment and browser console contain no local catalogue or CORS errors.

Run Python tests only while scraper code still exists. Final consumer checks include npm typecheck, npm test, npm build, and relevant browser checks.

## 9. Cutover and retirement
1. Deploy a build that consumes TKKGData while the old data source is still available for comparison.
2. Compare episode count, numbering, titles, ordering, and fields used by the UI.
3. Verify progress migration and offline behaviour.
4. Monitor a real refresh against the published dataset.
5. Only then remove the old scraper and catalogue publication workflow.
6. Update request notes and knowledge base with exact files removed, tests run, and outstanding manual results.
7. Retire request 009 and draft PR #14 only after their useful work is safely transferred and the user approves the final disposition.

## 10. Definition of done
The tracker consumes TKKGData as its only shared episode data source, retains all user progress locally, works online and offline, has no active scraper or authoritative catalogue of its own, and passes automated and manual verification.
