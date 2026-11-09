# Notes: Request 010

## Approved migration constraint

Oliver explicitly approved the migration on 2026-11-09 with one overriding requirement: TKKGTracker must retain all existing functionality. The app UI, interactions, progress storage, import/export format, PWA installation, service worker, same-origin catalogue URL, and offline behaviour must remain unchanged.

## Migration findings
- TKKGTracker main contains 243 episode records, numbered 1 through 243.
- The app imports data/episodes.json as its initial bundled fallback and fetches data/episodes.json from the same origin at startup.
- The service worker uses the same-origin catalogue URL and caches it for offline use.
- Personal progress remains in browser storage under the existing storage key and is not part of the shared catalogue.
- TKKGData owns the scraper, source adapters, schema, enrichment, validation, and publication.
- TKKGData PR #1 was merged to main as commit c34827fdf5b547e39bac79055ab8c498652e9af6.
- The TKKGData main endpoint was checked after merge: 243 records, numbering 1 through 243, metadata schema 1.0.0, and metadata count 243.

## Implementation status

Implemented on this request branch:
- Added scripts/sync-catalogue.mjs to fetch the TKKGData dataset and metadata, validate schema version, count, numbering, titles, and UI-required array fields, then update the existing local build input.
- Added npm run sync:data.
- Updated deployment and test workflows to run the sync before building.
- Changed deployment to refresh weekly after the TKKGData scheduled refreshes.
- Kept the app's same-origin data/episodes.json runtime URL and public/data/episodes.json output.
- Updated README, project instructions, implementation plan, and knowledge base to document the new ownership and strict behaviour-preservation constraint.
- No changes have been made to src/App.tsx, src/catalogue.ts, src/types.ts, src/storage.ts, src/styles.css, public/service-worker.js, or the progress storage format.

Still pending:
- Run the tracker CI against the now-published TKKGData main dataset.
- Verify the production build and deployed PWA behaviour.
- Only after successful verification, remove the old scraper, schema, Python dependencies, scraper-only tests, CSV, scrape report, and catalogue update workflow.
- Keep data/episodes.json as a last-known-good local fallback and app build input.
- Verify all changed files and prove that the UI and progress code are unchanged.

## Test results

Earlier documentation-only PR #15 run 42695883009 passed all Python tests but the frontend job failed during npm install with npm 10.9.9 reporting "Cannot read properties of null (reading 'edgesOut')". The frontend checks were skipped.

The build-time sync integration was verified in GitHub Actions run 42698864075:
- The TKKGData sync script syntax check passed.
- The script fetched the live TKKGData main dataset and metadata and validated all 243 records.
- npm 11 installation succeeded after npm 10.9.9 repeatedly failed with the known edgesOut error.
- npm audit passed.
- TypeScript typecheck passed.
- Frontend tests passed.
- Production Vite build passed.

The PR changed no tracker application source files, UI components, styling, progress storage, or service worker. The changed-file list confirms that src/App.tsx, src/catalogue.ts, src/types.ts, src/storage.ts, src/styles.css, and public/service-worker.js are untouched. The local data/episodes.json fallback is retained.

The scraper, schema, CSV/report, scraper tests, Python dependencies, and old catalogue update workflow were removed from TKKGTracker after the TKKGData build-time sync passed. Historical request records remain for audit. The old audio enrichment PR #14 was closed after transferring its implementation to TKKGData.

The migration was merged to main in commit aebed2ff7041d01ccceaa6e0fe9d139b427d00f0.
- GitHub Pages deployment run 42700393538 completed successfully.
- The deploy workflow fetched and validated the 243-record TKKGData dataset, built the application, and deployed the Pages artifact.
- No application source, styling, progress storage, or service worker files were changed.

Manual verification in a real browser and installed PWA has not yet been performed. It remains the final confirmation for progress preservation and offline operation.
