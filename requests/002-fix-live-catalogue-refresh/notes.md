# Request notes: Fix live catalogue refresh

## Observed failure
- Refresh run: https://github.com/OliverZsuffa/TKKGtracker/actions/runs/39111424594
- Build/deploy run: https://github.com/OliverZsuffa/TKKGtracker/actions/runs/39111315474
- Report artifact: https://github.com/OliverZsuffa/TKKGtracker/actions/runs/39111424594/artifacts/12130846723
- Fatal error: `Only 142 episodes discovered; refusing to publish a suspiciously small catalogue.`
- Report source counts: 217 archive index entries, 146 official records, 11 archive detail records.
- Report official maximum episode number: 500.
- Archive detail warnings repeatedly show URLs shaped like `https://www.tkkg-site.de/de/hoeren/hoerspiele/de/hoeren/hoerspiele/serie/folge-001/inhalt.html`, which return 404.
- The scraper correctly refused to publish the incomplete result. The failure guard must remain in place.

## Workflow annotations
- checkout/setup-node/setup-python/upload-artifact/deploy-pages versions produced Node.js 20 deprecation warnings.
- `ubuntu-latest` emitted a notice about its planned migration to Ubuntu 26.
- These notices did not cause the scraper failure.

## Implementation progress
- Oliver approved the revised plan on 18 October 2026.
- Fixed archive index link normalization for root-relative, directory-relative, absolute, and previously duplicated paths. Links to `audio.tkkg-site.de` remain on that host.
- Tightened official catalogue parsing so episode headings must belong to a product card with its own cover image. The title is read from that same card instead of borrowing a previous heading elsewhere on the page.
- Added rejection diagnostics with the source page, candidate number, and reason for headings outside product cards or conflicting with the cover image number.
- Live HTML inspection established that each official product teaser and its collapsed detail panel are sibling elements. The teaser has the cover/title and an arrow link with `data-modal="#detail…"`; the linked panel contains the episode heading, synopsis, speakers, and credits. These details are already in the fetched HTML, so no browser automation or separate endpoint is needed for the observed fields.
- The official page sweep found that `?page=0` (the base URL) and `?page=1` return the same latest page; `?page=2` contains episodes 224 to 207 plus a product titled `Jede Legende hat Ihren Anfang (Hörspiel zum Kinofilm)`, labelled as episode 500. That is a film tie-in, not a regular main-series episode. Pages 3 to 8 continue the regular series back to episode 100; later pages have no episode headings. The parser now excludes the film tie-in by its explicit title classification and has a regression test.
- Added regression tests for archive URL forms, audio subdomain preservation, and the official episode-500 false-positive shapes.
- Updated GitHub Actions to current Node 24 compatible action releases and pinned Ubuntu 24.04 rather than relying on the moving `ubuntu-latest` label.
- GitHub Actions run `39114137635` passed both Python and frontend jobs, including unit tests, `npm audit --audit-level=high`, type checking, Vitest, and production build.
- The final branch-only live diagnostic succeeded: https://github.com/OliverZsuffa/TKKGtracker/actions/runs/39114134477. Its report and generated JSON/CSV artifact is https://github.com/OliverZsuffa/TKKGtracker/actions/runs/39114134477/artifacts/12131188010.
- The live report records 217 index entries, 206 successfully fetched historical detail pages, 144 accepted official records including 3 verified detail-page fallbacks, 243 merged episode records, no numbering gaps, and no schema validation errors. The 11 audio-subdomain posts were skipped because robots.txt returned HTTP 403; the official catalogue covers those numbers.
- The artifact contains 243 JSON records and 243 CSV rows. Spot checks confirmed records 1, 100, and 206 from the archive, plus 207, 217, 222, 223, 234, and 243 from the official source.
- The live diagnostic generates files in an isolated workflow workspace and uploads them as an artifact. It does not commit generated data or deploy the site. Deployment and browser smoke testing remain pending until the PR is merged.

## Status
Implementation, automated checks, and live catalogue validation are complete. The PR is ready for review. Production deployment and browser smoke testing remain unverified until merge.
