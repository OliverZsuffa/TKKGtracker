# Request 010: Make TKKGTracker a TKKGData consumer

## Status
Approved by Oliver on 2026-11-09. Implementation in progress. The migration must preserve all existing TKKGTracker functionality without user-visible changes.

## Desired outcome
Change TKKGTracker from a combined scraper and listening tracker into a focused application that consumes the canonical dataset published by TKKGData.

TKKGTracker remains responsible for presenting episode information and storing the user's listening progress locally. It must no longer discover, scrape, validate, enrich, or publish shared TKKG episode metadata.

## Context
The new repository OliverZsuffa/TKKGData is intended to become the single source of truth for episode data, source discovery, Spotify and YouTube Music mappings, provenance, validation, and publication.

Today TKKGTracker owns:
- Python source scraping and catalogue reconciliation.
- Episode schema and generated JSON/CSV catalogue.
- Official listening-link extraction and source knowledge.
- The web app, local progress storage, PWA, and offline behaviour.
- The shared audio enrichment work currently developed in draft PR #14.

The scraper, schema, data, source enrichment, and their maintenance workflows belong in TKKGData. The app, local progress, PWA, and user-facing catalogue presentation remain here.

TKKGData request 001 defines the shared architecture. This request depends on its approved schema, published endpoint, and compatibility contract.

## Required behaviour
1. Load episode data from the stable published TKKGData dataset.
2. Validate the dataset version and required structure before replacing the currently cached dataset.
3. Retain the last-known-good dataset for offline use and temporary network failures.
4. Keep listening progress, ratings, notes, favourites, and settings in browser-local storage. Never move personal progress into TKKGData.
5. Preserve existing app behaviour and episode identity across the migration.
6. Handle optional metadata and missing source links without breaking the UI.
7. Remove the in-repository scraper, schema, generated episode catalogue, source enrichment, and scheduled scraping workflow only after the TKKGData replacement has been verified in production.
8. Do not maintain an independently editable or authoritative copy of episode metadata in this repository.
9. Keep app deployment, PWA caching, progress import/export, and user-facing features in TKKGTracker.

## Scope

### Included
- Audit every runtime and build-time consumer of the current local catalogue.
- Define the exact TKKGData endpoint, schema version compatibility, and cache strategy with the TKKGData project.
- Replace local catalogue loading with TKKGData consumption.
- Validate fetched JSON before updating the cache.
- Preserve offline functionality and local progress.
- Remove scraper, source adapters, audio enrichment, catalogue schema, generated catalogue files, and scrape-only workflows after successful cutover.
- Update README, project instructions, knowledge base, and deployment documentation.
- Add contract tests using a fixed TKKGData fixture and tests for network failure and invalid data.
- Coordinate the disposition of draft PR #14 and request 009 after its useful work has been migrated to TKKGData.

### Not included
- Scraping, source discovery, data correction, or provider matching in TKKGTracker.
- Storing or synchronizing listening progress in TKKGData.
- Downloading audio.
- Changing the visual design or unrelated app features.
- Removing the old catalogue path before the replacement has passed the cutover checks.

## Acceptance criteria
- [ ] The app reads the published TKKGData dataset using the agreed stable endpoint.
- [ ] The app validates schema compatibility and required fields before accepting a new dataset.
- [ ] A failed fetch, invalid response, or incompatible schema does not overwrite the last-known-good cache.
- [ ] Offline launch continues to display the last valid catalogue.
- [ ] Existing progress, ratings, notes, favourites, and settings survive the migration unchanged.
- [ ] Episode identity and ordering remain stable across the old and new datasets.
- [ ] Optional or missing metadata does not break rendering.
- [ ] No active scraper or source-enrichment workflow remains in TKKGTracker after cutover.
- [ ] No second authoritative episode JSON or CSV is maintained here.
- [ ] The old scraper and audio enrichment are retired only after TKKGData publication and app consumption are verified.
- [ ] Automated tests, typecheck, frontend tests, and production build pass.
- [ ] Manual online, refresh, offline, progress-preservation, and PWA checks pass.
- [ ] README and knowledge base accurately describe TKKGTracker as a consumer application.

## Dependencies
- TKKGData request 001 must be approved and implemented sufficiently to publish a valid dataset.
- TKKGData must provide a stable endpoint, schema version, sample data, and compatibility policy.
- The migration audit must identify all uses of current JSON, CSV, schema, scraper outputs, and source-specific fields.
- The existing draft PR #14 must be reviewed so useful audio discovery work is preserved in TKKGData before the tracker implementation is retired.

## Open questions
- Should the tracker fetch the latest dataset directly at runtime or use a build-time snapshot with runtime refresh? The preferred direction is runtime fetch plus last-known-good cache, subject to PWA and CORS testing.
- Which fields currently used by the UI are not represented in the proposed TKKGData contract?
- Should the app expose the dataset version and last refresh time in its diagnostics or settings?
