# Testing: Episode streaming links

**Status:** Test plan updated for the implementation; actual automated and manual results pending.

## Automated tests to add

- [ ] Official episode parsing extracts only an episode-specific “Jetzt anhören” destination from the matching product card, not unrelated navigation/product links.
- [ ] Official episode hub destinations preserve the source listing URL and are distinguished from series-wide hubs.
- [ ] Exact episode/release, series, search, and official-hub links remain distinct.
- [ ] Valid HTTPS URLs pass; javascript:, data:, malformed URLs, unsupported protocols, missing provenance, and invalid link types fail validation.
- [ ] Duplicate service/destination entries are handled deterministically.
- [ ] Missing or empty listening_links remains valid.
- [ ] A failed listening-link fetch does not erase or invalidate unrelated episode metadata.
- [ ] Coverage report accurately counts direct, fallback, missing, duplicate, and malformed links.
- [ ] UI renders episodes with and without an official hub and offers clearly labelled service-search fallbacks.
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

- Automated GitHub Actions checks: pending.
- Manual browser, mobile, and keyboard checks: not yet performed.
