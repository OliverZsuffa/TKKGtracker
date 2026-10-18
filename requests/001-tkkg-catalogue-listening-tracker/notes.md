# Request notes: TKKG catalogue and listening tracker

## Current state
The request and plan are approved. The Python scraper, schema, source adapters, static listening tracker, test suite, and GitHub Actions workflows have been implemented on the request branch. The catalogue has not yet been generated from live sources.

## Source reconnaissance
- Official catalogue: https://www.tkkg.de/produkte/hoerspiele
- Historical index: https://www.tkkg-site.de/de/hoeren/hoerspiele/serie.html
- Newer episode posts are linked from the historical index at https://audio.tkkg-site.de/
- The historical index covers episodes through 217, and official catalogue pages include newer releases.
- The official catalogue has some repeated or conflicting episode numbers, including a live album listing. The scraper excludes obvious live albums and reports conflicting titles.
- The scraper checks robots.txt before requesting pages and fails closed when it cannot establish permission. The live runtime result is not yet known.

## Implemented
- Python source adapters for the official catalogue, historical archive, and linked newer episode posts.
- In memory response caching and conservative request pacing.
- Source provenance, record merging, JSON Schema validation, gap detection, conflict reporting, and JSON/CSV export.
- A guard against publishing an unexpectedly small or incomplete catalogue.
- Responsive React interface with search, sorting, listened filters, episode details, local progress, personal ratings and notes, and progress import/export.
- GitHub Actions checks for Python tests, frontend tests, type checking, production build, and high severity dependency audits.
- Weekly and manual catalogue refresh workflow, failure report artifact, and deployment after a successful catalogue refresh.
- Project request and approval instructions and the reusable Knowledge Base structure.

## Automated verification
GitHub Actions run 56 completed the Python test job and frontend job successfully. The frontend job passed npm audit at the configured high severity threshold, TypeScript type checking, Vitest tests, and the Vite production build. The Python unit tests passed.

An earlier run exposed a TypeScript state update error and a merge test expectation issue. Both were corrected. A later run also passed after the source parsing tests were expanded.

## Not yet verified
- The scraper has not been run against the live source sites in GitHub Actions.
- The generated full episode dataset, actual source field coverage, and source terms/robots response remain unverified.
- The GitHub Pages deployment has not been run or verified.
- Manual browser tests have not been performed.

## Remaining work
1. Review the implementation and request documents.
2. After merging the branch, inspect the catalogue refresh workflow result and scrape report.
3. Resolve any real source selector issues, title conflicts, or numbering gaps before accepting the generated dataset.
4. Confirm GitHub Pages settings permit Actions based deployment.
5. Perform the manual browser tests and record actual observations in testing.md.
6. Update the Knowledge Base with any durable lessons discovered during live scraping and deployment.
