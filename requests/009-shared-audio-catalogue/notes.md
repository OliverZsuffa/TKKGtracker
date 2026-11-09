# Notes: Shared TKKG audio catalogue

## Implementation started

- Approved planning PR #13 was merged into main.
- Implementation branch: `feat/009-shared-audio-catalogue`.
- Added an optional `audio_release` schema object with Spotify, YouTube Music, and verification sections.
- Added `scraper.audio_enrichment` with a dry-run-first CLI, spotDL metadata resolution, unauthenticated YouTube Music search and playlist retrieval through ytmusicapi, strict ordered track-title matching, ambiguity rejection, and bounded episode selection.
- Added validation that provider IDs agree with URLs and all three verified track counts agree.
- Added CSV export support.
- Added preservation of existing verified audio mappings during normal catalogue refreshes.
- Added tests using mocked provider responses.
- Added a manual GitHub Actions workflow. A push on the implementation branch attempts a dry-run discovery for episode 150 and uploads a JSON report.

## Verification status

Automated CI and the live episode 150 discovery workflow have been triggered. Their outcomes must be recorded after the runs finish. No live Spotify or YouTube Music result is claimed verified yet.

The Python unit-test job passed on commits \`1248b55c\`, \`1616090f\`, and \`ccd48981\`. The frontend job repeatedly stopped at \`npm install\` with npm 10.9.9 error \`Cannot read properties of null (reading 'edgesOut')\`; typecheck, frontend tests, and build therefore did not run.

The first live episode 150 run installed FFmpeg successfully and rejected the Spotify album because its returned track numbers did not form a complete unique sequence. A subsequent run passed Spotify validation but found no YouTube Music candidates. Inspection of the ytmusicapi 1.12.3 documentation showed the root cause: album search results expose an `MPRE...` `browseId`, not a playlist ID. The implementation originally only recognized `playlistId` and `VLPL...` playlist browse IDs. It now resolves album browse IDs with `YTMusic.get_album()` and extracts the corresponding `audioPlaylistId` (`OLAK5uy_...`) before retrieving the public playlist. The candidate search is also bounded and filters titles before fetching playlist details. A new live run is pending. No live Spotify/YouTube Music pairing is claimed verified yet.

The current local execution environment cannot reach GitHub or install dependencies, so execution is being delegated to GitHub Actions. The implementation branch is not merged.

## Outstanding work

- Inspect CI and live discovery results.
- Fix any failures before proceeding.
- If episode 150 verifies, save a fixture containing the actual retrieved track metadata and add the regression assertion for its 40 track records. Do not fabricate track titles.
- If the discovery run fails, record the provider response and adjust the implementation only with evidence.
- Verify the manual spotDL pair with the TKKGDownloader spotDL version.
- Run a representative historical episode test before attempting any backfill.
- Update the request testing record and implementation plan with actual results.
