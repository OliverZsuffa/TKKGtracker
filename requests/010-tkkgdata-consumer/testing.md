# Testing plan: Request 010

**Status:** Automated integration checks are running. Browser and installed-PWA checks remain manual.

## Dataset synchronization
1. Run node --check scripts/sync-catalogue.mjs.
   Expected: the sync script parses successfully.
2. Run npm run sync:data.
   Expected: TKKGData metadata and episode JSON are fetched and validated, and data/episodes.json is updated only after both are valid.
3. Test an unsupported schema version, count mismatch, duplicate number, numbering gap, missing title, and missing UI-required array.
   Expected: the script fails without replacing the existing local fallback.
4. Simulate a temporary 404 or server error.
   Expected: bounded retries occur, then a clear failure if the source remains unavailable.

## Tracker regression
1. Compare the built app's catalogue URL before and after migration.
   Expected: the runtime URL remains the same-origin data/episodes.json.
2. Verify src/App.tsx, src/catalogue.ts, src/types.ts, src/storage.ts, src/styles.css, and public/service-worker.js are unchanged.
   Expected: no app behaviour code changes.
3. Run npm run typecheck, npm test, and npm run build after the dataset sync.
   Expected: all pass.

## Personal progress preservation
1. Export progress before deploying the migration.
   Expected: the existing tkkgtracker-progress.json format is unchanged.
2. Load the new build in the same browser profile.
   Expected: listened status, ratings, notes, and settings remain unchanged.
3. Import a pre-migration export.
   Expected: all records map to the same episode numbers.

## PWA and offline behaviour
1. Load the deployed app online.
   Expected: the same-origin catalogue loads successfully.
2. Install or update the PWA.
   Expected: installation and launch behave as before.
3. Go offline and relaunch the installed PWA.
   Expected: app shell and last-known-good catalogue remain available.
4. Return online and refresh.
   Expected: the deployed latest catalogue is loaded without reinstalling the app.

## Repository ownership
1. Search production workflows and code for source scraping or audio discovery.
   Expected: none remains in TKKGTracker.
2. Confirm TKKGData owns the schema, scraper, source adapters, enrichment, and catalogue publication.
   Expected: TKKGTracker is a read-only consumer.

## Actual observations
- TKKGData synchronization succeeded in GitHub Actions run 42698341703.
- npm 10.9.9 failed during dependency installation with the known edgesOut error. The workflow was updated to install npm 11 before dependency installation. Final CI result is pending.
- Browser progress, installed-PWA, and offline checks have not been performed in this environment.
