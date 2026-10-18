# Implementation plan: Episode streaming links

**Status:** Proposed; awaiting Oliver's explicit approval. Do not implement before approval.

## 1. Research and baseline

1. Read project instructions, docs/knowledge, approved decisions, and relevant catalogue-source/request notes.
2. Inspect current main catalogue, schema, source adapters, merge precedence, validation/report generation, CI workflows, and episode-detail UI.
3. Research official TKKG/EUROPA episode pages and their “Jetzt anhören” destinations, including any universal smart links and outbound service links. Sample early, middle, and recent episodes; do not assume all eras use the same format.
4. Investigate candidate services: Spotify, Apple Music, Amazon Music, Deezer, YouTube Music, YouTube, and EUROPA Hörspiel Player. Keep the final list evidence-led.
5. Respect source terms, robots/access rules, and platform restrictions. Do not bypass blocks, use unsupported private APIs, or introduce high-volume scraping.
6. Record baseline episode count, validation state, CI state, and existing source-link fields.

## 2. Data model and provenance

After confirming the source shape, add an optional listening_links array to each episode. Proposed entry fields:

- service: stable ID, e.g. spotify, apple_music, amazon_music, deezer, youtube_music, youtube, europa_player
- label: human-readable service name
- url: absolute HTTPS destination
- link_type: episode, release, series, search, or official_hub
- source_url: page or official smart link from which the destination was obtained
- retrieved_at: optional timestamp if useful and consistent with existing provenance conventions

Keep direct episode/release links distinct from fallback search/series/hub links in both data and UI. Keep the field optional so records without verified destinations remain valid. Validate HTTPS URLs, recognised service IDs, link types, required provenance, and duplicates. Never turn arbitrary scraped text into clickable destinations.

Do not overload existing source references: a listening destination is not itself a source citation. Streaming links belong to catalogue metadata, not personal state; preserve local progress and import/export formats.

## 3. Discovery strategy

- Prefer destinations explicitly exposed by official episode pages or official universal-link pages.
- Test whether any universal link is stable per episode and whether its service destinations can be extracted safely without unsupported endpoints.
- For services not represented by official outbound links, consider a platform-specific search URL only as an explicitly labelled “Search on …” fallback, if useful. Do not claim that this confirms availability and do not guess episode IDs.
- Avoid platform scraping that violates access rules. If manual verification is needed, create an auditable mapping/report instead of fabricating coverage.
- Use saved HTML fixtures and focused parser tests.
- A failed listening-link lookup must not invalidate otherwise valid episode metadata.

## 4. User interface

- Add a **Listen on** section in episode details, matching the current TKKGTracker design.
- Use service names and accessible text; avoid a large logo/icon dependency.
- Label link types accurately: direct episode/release, series, search, or official hub.
- Open external destinations in a new tab with safe link attributes and descriptive accessible names.
- Handle zero, one, or many links gracefully. Hide an empty section or show a subtle “No verified listening links yet” state where useful.
- Avoid presenting a wall of generic search buttons as if every service has the episode.
- Ensure keyboard access, visible focus, mobile layout, and long service names.
- Where practical, connect missing/wrong link reporting to the existing local-only report workflow. Never auto-submit reports.

## 5. Tests and quality gates

### Automated
- Parse official episode and universal-link destinations from saved fixtures.
- Distinguish exact episode/release links from series/search/hub links.
- Validate HTTPS URLs; reject javascript:, data:, malformed URLs, missing provenance, and unsupported link types.
- Test duplicate handling, empty/missing arrays, partial source failures, and merge behavior.
- Verify coverage reports accurately count direct links, fallbacks, missing links, duplicates, and malformed destinations.
- Test UI rendering with zero, one, or many links, including accessible labels and safe external-link attributes.
- Run all existing scraper, schema, search, ratings, notes, storage, and report regression tests.
- Run Python tests, npm run typecheck, npm test, npm run build, npm audit --audit-level=high, and catalogue validation/refresh diagnostics as appropriate.

### Manual
- Inspect one early, one middle-era, and one recent episode.
- Open every displayed link and verify its destination matches the label and episode.
- Verify fallback links are clearly labelled as search/series/hub destinations.
- Check an episode without verified links, desktop/mobile layout, keyboard navigation, and existing progress persistence/import/export.

## 6. Coverage and release reporting

Create a repeatable report showing total episodes checked, verified direct links per service, fallback links per service, episodes without listening links, and duplicate/malformed/unresolved destinations. Do not claim every service is supported for every episode unless the report proves that. Preserve the last valid catalogue if validation fails.

## 7. Sequence after approval

1. Establish a clean branch from current main and record baseline checks.
2. Complete link-source feasibility research and document evidence and gaps.
3. Finalise schema and add fixtures/tests.
4. Implement extraction, provenance, merge behavior, validation, and coverage reporting.
5. Regenerate catalogue data and audit samples plus full coverage.
6. Implement the episode-detail UI and tests.
7. Run quality gates and review the diff for unrelated changes.
8. Update request notes/testing and durable knowledge with verified findings.
9. Leave the work for Oliver's review. Do not merge or deploy without explicit instruction.

## Guardrails

Accuracy matters more than displaying a full row of services. Link presence does not guarantee regional or subscription availability. No credentials, paid API dependency, backend, playback, accounts, analytics, or access-control bypass. Do not change personal progress or its import/export schema.
