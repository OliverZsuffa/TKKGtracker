# Request 007: Episode streaming links

**Status:** Proposed; awaiting Oliver's explicit approval. No implementation or catalogue changes are authorized yet.

## Goal

Make it easy to open each TKKG episode on services where it can actually be heard, directly from TKKGTracker.

## Desired outcome

- Add a clear **Listen on** area to episode details.
- Research services such as Spotify, Apple Music, Amazon Music, Deezer, YouTube Music, YouTube, and the official EUROPA Hörspiel Player. Include only services for which a reliable destination can be established.
- Prefer direct links to the exact episode/release. Clearly distinguish these from series pages, search results, and general listening hubs.
- Never invent platform IDs or imply that a service carries an episode when only a generic page is known.
- Where useful, let users report missing or incorrect links through the existing local-only gap-report workflow.

## Scope

- Research official TKKG/EUROPA listening links and per-service availability before finalising the data model.
- Extend the catalogue schema, scraper/merge/validation, and generated data only as necessary to store verified links with provenance.
- Add a responsive, accessible listening-links UI.
- Add automated tests and a repeatable link-coverage report.
- Keep links in catalogue data, separate from personal browser progress.

## Out of scope

- In-app audio playback or embedded players.
- Accounts, API keys, paid APIs, server/backend, cloud storage, or user tracking.
- Guessing direct URLs or claiming complete coverage without evidence.
- TKKG Junior or unrelated series.
- Changes to listened status, ratings, notes, or progress import/export.
- Bypassing access restrictions or weakening existing source-access checks.

## Acceptance criteria

1. Every direct listening link is sourced or individually verified.
2. Link types distinguish exact episode/release links from series, search, and hub destinations.
3. External links have descriptive accessible names and safe new-tab attributes.
4. Missing links remain valid catalogue data and do not break the UI or refresh.
5. Existing catalogue and personal progress behavior remain compatible.
6. Tests cover parsing, validation, duplicates, partial coverage, and rendering.
7. A coverage report lists direct links, fallback links, missing links, and invalid/duplicate destinations.
