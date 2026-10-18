# Testing: Episode streaming links

**Status:** Planned; no implementation tests have been run.

## Automated tests to add

- [ ] Official episode parsing extracts listening destinations, not unrelated navigation/product links.
- [ ] Universal-link parsing recognises supported services and preserves provenance.
- [ ] Exact episode/release, series, search, and official-hub links remain distinct.
- [ ] Valid HTTPS URLs pass; javascript:, data:, malformed URLs, unsupported protocols, missing provenance, and invalid link types fail validation.
- [ ] Duplicate service/destination entries are handled deterministically.
- [ ] Missing or empty listening_links remains valid.
- [ ] A failed listening-link fetch does not erase or invalidate unrelated episode metadata.
- [ ] Coverage report accurately counts direct, fallback, missing, duplicate, and malformed links.
- [ ] UI renders zero, one, many, and mixed direct/fallback links correctly.
- [ ] External links have descriptive accessible names and safe new-tab attributes.
- [ ] Existing scraper, schema, search, ratings, notes, storage, progress import/export, and gap-report tests still pass.

## Manual checklist

- [ ] Compare one early, one middle-era, and one recent episode with their official pages/link hubs.
- [ ] Open each displayed service link and confirm its destination matches the label.
- [ ] Verify search/series/hub links are explicitly labelled as fallbacks.
- [ ] Inspect an episode without verified links.
- [ ] Check desktop/mobile layout, keyboard navigation, visible focus, and external-link behavior.
- [ ] Review coverage output for suspicious gaps or duplicates.
- [ ] Confirm listened status, ratings, notes, and progress import/export remain unchanged.
- [ ] Deploy only after tests pass and Oliver explicitly requests publishing.

## Actual results

_To be filled after implementation; do not pre-mark checks as passed._
