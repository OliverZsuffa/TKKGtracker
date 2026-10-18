# Request: Fix live catalogue refresh and Actions warnings

## Status
Awaiting approval

## Desired outcome
The scheduled/manual catalogue refresh should discover the regular main-series TKKG episodes from the public sources, validate the result, and only then update the catalogue and trigger deployment. GitHub Actions should use maintained runner/action versions compatible with the current Node.js runtime.

## Context
After PR #1 was merged, the first live catalogue refresh failed on 18 October 2026. The workflow report records 217 archive index entries, 146 official records, but only 11 archive detail records. Most archive detail URLs returned 404 because the generated URLs duplicated the `/de/hoeren/hoerspiele/` path segment. The run stopped with: `Only 142 episodes discovered; refusing to publish a suspiciously small catalogue.`

The official source also reported a maximum episode number of 500, which is suspicious and needs investigation rather than treating it as valid coverage. The separate Pages build completed successfully, but with the committed empty catalogue it cannot show real episode records.

The first run also emitted maintenance warnings because workflow actions still target Node.js 20, plus a notice that `ubuntu-latest` is moving to Ubuntu 26.

## Required behaviour
- Build archive detail URLs correctly for both root-relative and site-root-relative links.
- Test URL handling using representative real-world link forms, including the malformed form observed in the live report.
- Investigate why the official adapter reports episode 500 and ensure only valid regular main-series records count toward catalogue coverage.
- Make source coverage and out-of-range or suspicious records visible in the scrape report.
- Keep the existing protection against publishing incomplete data.
- Update workflow actions to maintained versions compatible with the current GitHub Actions Node.js runtime, after confirming version compatibility.
- Address the Ubuntu runner migration notice in a deliberate, tested way rather than changing the runner blindly.
- Record real test and live-refresh outcomes. Do not claim the catalogue or site is ready until the refresh and deployment are verified.

## Scope

### Included
- Focused scraper URL fix and source-adapter tests.
- Investigation and correction of suspicious official-source records.
- More actionable scrape diagnostics where needed.
- Workflow action and runner maintenance.
- Automated tests and a live refresh attempt after approval.

### Not included
- Rebuilding the user interface or changing listening-progress behaviour.
- Relaxing the catalogue completeness guard just to make the workflow pass.
- Fabricating missing episodes or metadata.
- Deploying a partial catalogue.

## Acceptance criteria
- [ ] Archive episode detail URLs resolve to the intended pages without duplicated path segments.
- [ ] Tests cover root-relative and site-root-relative archive links.
- [ ] The official source's episode-500 result is explained and invalid records are excluded by a tested rule.
- [ ] The scrape report makes source counts, suspicious numbers, gaps, and fatal errors diagnosable.
- [ ] Python tests, frontend tests, type checking, dependency audit, and production build pass.
- [ ] A live refresh completes successfully and the generated catalogue passes schema and completeness validation.
- [ ] The Pages deployment uses the successfully refreshed catalogue and is checked in a browser.
- [ ] Action/runtime maintenance warnings are resolved where supported, and any remaining runner notice is documented.

## Manual testing
See [testing.md](testing.md).

## Reference material
- Failed refresh: https://github.com/OliverZsuffa/TKKGtracker/actions/runs/39111424594
- Failed refresh report artifact: https://github.com/OliverZsuffa/TKKGtracker/actions/runs/39111424594/artifacts/12130846723
- Pages build/deploy run: https://github.com/OliverZsuffa/TKKGtracker/actions/runs/39111315474
- Historical archive index: https://www.tkkg-site.de/de/hoeren/hoerspiele/serie.html
- Official catalogue: https://www.tkkg.de/produkte/hoerspiele

## Open questions
None currently. The source report and URL construction bug establish a concrete starting point; any material source restrictions discovered during investigation must be documented before continuing.
