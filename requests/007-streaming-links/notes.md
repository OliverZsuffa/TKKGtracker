# Implementation notes: Episode streaming links

**Status:** Implementation in progress on the approved request branch; automated CI not yet verified.

## Initial research

- Official TKKG catalogue listing: https://www.tkkg.de/produkte/hoerspiele
- Official universal listening link: https://tkkg.lnk.to/alle-hoerspiele
- Official playlist page says its TKKG playlists are available on Spotify and Deezer: https://www.tkkg.de/produkte/playlisten
- An official Apple Music TKKG Hörspiele playlist exists: https://music.apple.com/de/playlist/tkkg-h%C3%B6rspiele/pl.016833f1948440a5ba0503e62d469b20

The playlist and universal links establish useful starting points, but they do not prove direct per-episode availability on every service. Exact per-episode link formats and service coverage have not yet been audited.

## Implementation outcomes

- Added optional listening_links catalogue metadata, JSON Schema validation, merge support, and CSV export.
- Added a repeatable listening-link coverage summary to data/scrape-report.json, including episodes with/without links, counts by service/type, direct-vs-hub/fallback counts, and invalid destinations.
- The official source adapter extracts only an episode-specific “Jetzt anhören” link hosted on tkkg.lnk.to; it does not fabricate aliases.
- Added a “Listen on” section to episode details. Official hub links are shown separately from six platform search shortcuts; search availability is explicitly caveated.
- Added frontend tests for official-link filtering and platform searches, plus scraper/schema/merge regression tests.

## Automated checks

Not run locally because this environment has no GitHub network access. GitHub Actions results are pending.\n
- First PR CI run: frontend checks passed (npm install, audit, typecheck, tests, build). Python suite identified that the listening-link fixture places the link inside the detail panel; parser was adjusted to inspect links inside the panel and then adjacent siblings. A fresh run on the updated head is pending.


## Questions for the research phase

- Which service destinations does the official universal link expose for each episode?
- Do older and newer episodes use the same link format?
- Which services have verified direct episode/release links?
- Should platform-specific search destinations be included as labelled fallbacks, or should the initial release show only verified direct/official destinations?
