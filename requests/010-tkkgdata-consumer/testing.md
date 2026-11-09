# Testing plan: Request 010

**Status:** Planned only. No implementation or test execution has started.

## Contract tests
1. Load a valid TKKGData fixture.
   Expected: all supported episode records parse and render.
2. Load an unsupported schema version.
   Expected: the response is rejected and the previous cached dataset remains intact.
3. Load malformed JSON or records missing required fields.
   Expected: the response is rejected without replacing the cache.
4. Simulate network failure after a successful load.
   Expected: the app uses the last-known-good dataset.
5. Simulate network failure before the first successful load.
   Expected: the app displays a clear recoverable empty/error state.

## Progress preservation
1. Export progress before migration.
   Expected: export includes all current user progress and preferences.
2. Load the migrated app using the same browser storage.
   Expected: listened status, ratings, notes, favourites, and settings remain unchanged.
3. Import a pre-migration export.
   Expected: all records map to the same episodes.
4. Test any changed episode ID mapping.
   Expected: no progress record is silently dropped or assigned to a different episode.

## PWA and runtime
1. Load the deployed app online.
   Expected: TKKGData fetch succeeds from the deployed origin.
2. Publish a newer compatible dataset.
   Expected: app refresh retrieves it and keeps user progress.
3. Go offline and relaunch the installed PWA.
   Expected: app shell and last-known-good catalogue remain available.
4. Return online and refresh.
   Expected: the newest valid dataset is adopted.

## Regression
1. Test search, filters, episode detail, sorting, and all existing catalogue views.
   Expected: behaviour remains unchanged.
2. Test episodes with missing optional metadata.
   Expected: no UI crash or misleading placeholder.
3. Run npm run typecheck, npm test, and npm run build.
   Expected: all pass.
4. Confirm no active tracker workflow performs source scraping or audio enrichment.
   Expected: shared data maintenance exists only in TKKGData.

## Actual observations
Record Oliver's browser and device observations here without overwriting earlier results.
