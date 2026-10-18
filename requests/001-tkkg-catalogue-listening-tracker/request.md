# Request: Complete TKKG catalogue and listening tracker

## Status
Awaiting approval

## Desired outcome
Build a static web application that lists all regular episodes in the main TKKG audio drama series and lets Oliver mark episodes as listened to. A Python scraper will collect catalogue data and GitHub Actions will periodically refresh the validated dataset.

## Context
The repository is newly created. The previously discussed product plan calls for a browser based tracker backed by a generated JSON catalogue. Scraping will happen in Python during scheduled GitHub Actions runs, not in the browser.

Primary candidate sources:
- Official catalogue: https://www.tkkg.de/produkte/hoerspiele
- TKKG Site archive: https://www.tkkg-site.de/de/hoeren/hoerspiele/serie.html

Source coverage, terms, page structure, and exact metadata availability must be verified during source reconnaissance.

## Required behaviour

### Catalogue
- Include the regular numbered main TKKG audio drama series.
- Discover the available episode range from sources instead of hard coding a presumed maximum.
- Show episode number, official title, and cover artwork when available.
- Support search, sorting, filtering by listened status, and episode detail views.
- Collect metadata where available: synopsis, cast, tracks, production credits, ratings and reviews, release dates, labels, formats, EANs, and other physical release details.
- Preserve source provenance and make missing information explicit.
- Keep TKKG Junior and unrelated special releases outside the initial scope.

### Listening progress
- Allow each episode to be marked listened or unlistened.
- Display listened count and completion percentage.
- Store progress and optional personal ratings or notes in browser local storage.
- Keep personal data separate from the shared catalogue.
- Support export and import of personal progress.

### Scraping and maintenance
- Use Python source adapters, normalisation, merging, schema validation, and JSON/CSV export.
- Detect duplicate numbers, title conflicts, unexpected catalogue shrinkage, and unexplained numbering gaps.
- Never fabricate metadata or silently replace valid data with an incomplete scrape.
- Run on a schedule and manually through GitHub Actions.
- Publish new catalogue data only after validation succeeds.
- Keep the existing valid dataset available if scraping or validation fails.

### Hosting
- Build a static app and deploy it to GitHub Pages through GitHub Actions.
- No backend, database service, user account, or paid API is required for the initial release.

## Scope

### Included
- Source reconnaissance and documented extraction strategy.
- Python scraper and source adapters.
- JSON Schema, normalisation, record merging, validation, and CSV/JSON export.
- Initial catalogue dataset and scrape report.
- Static listening tracker with local persistence and progress export/import.
- Automated tests and scheduled catalogue updates.
- GitHub Pages build and deployment workflow.
- Documentation and reusable knowledge updates.

### Not included
- Audio playback or downloading audio.
- User accounts or cloud synchronisation.
- A server side database or API.
- TKKG Junior or unrelated series.
- Bypassing access controls or source restrictions.
- Redistribution of cover artwork or other material without checking applicable permissions.

## Acceptance criteria
- [ ] The discovered regular main-series catalogue is represented, with coverage gaps and unresolved conflicts reported.
- [ ] Every episode has a unique number, a nonempty title, and source provenance.
- [ ] Optional metadata is extracted when available and is never invented.
- [ ] JSON and CSV exports are generated and validated.
- [ ] Automated tests cover parsing, merging, schema validation, and incomplete source responses.
- [ ] Users can search, sort, filter, open episode details, and mark listening status.
- [ ] Listening progress persists after reload and can be exported and restored.
- [ ] A failed scrape cannot overwrite the last valid catalogue.
- [ ] GitHub Actions supports scheduled and manual refreshes and static deployment.
- [ ] Manual browser test instructions and actual automated test outcomes are documented.

## Manual testing
See [testing.md](testing.md).

## Reference material
- https://www.tkkg.de/produkte/hoerspiele
- https://www.tkkg-site.de/de/hoeren/hoerspiele/serie.html

## Open questions
No blocking product questions have been identified yet. Source reconnaissance may reveal technical or permission constraints that require a proposed plan change and renewed approval.
