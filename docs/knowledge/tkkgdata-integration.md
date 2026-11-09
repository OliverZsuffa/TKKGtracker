# TKKGData integration

## Shared data ownership

TKKGData is the canonical owner of episode metadata, source scraping, release enrichment, schema validation, provenance, and publication.

Published endpoints:
- Latest episode array: https://raw.githubusercontent.com/OliverZsuffa/TKKGData/main/data/episodes.json
- Dataset metadata: https://raw.githubusercontent.com/OliverZsuffa/TKKGData/main/data/dataset-metadata.json

The episode endpoint deliberately retains the existing TKKGTracker JSON array shape and field names. Metadata and schema version are provided separately. The current contract is schema version 1.0.0.

## Tracker integration

The tracker does not fetch TKKGData directly in the browser. The deployment workflow runs scripts/sync-catalogue.mjs, which fetches the latest dataset and metadata, validates the schema version, episode count, unique contiguous numbering, titles, and required array fields, and then replaces the local build input.

The deployment continues to copy data/episodes.json into public/data/episodes.json. The app therefore uses the exact same same-origin URL, app code, service worker, cache, and offline fallback as before.

The tracked data/episodes.json is retained as a last-known-good local development fallback. It is not scraped or maintained independently. Run npm run sync:data to refresh it from TKKGData.

## Non-negotiable behaviour boundary

The migration must not change the tracker UI, search, filters, episode details, listening status, ratings, notes, favourites, localStorage key, progress import/export format, PWA installation, service worker, or offline behaviour. Do not upload personal progress to TKKGData.

TKKGTracker is a read-only consumer. All shared metadata corrections and source discovery happen in TKKGData.
