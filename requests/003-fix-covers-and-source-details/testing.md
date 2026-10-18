# Testing: Fix covers and source detail quality

**Status:** Planned only. Record actual results after implementation is approved.

## Automated tests
1. Run the focused archive source tests.
2. Verify episode 001 resolves to the known cover https://www.tkkg-site.de/uploads/pics/001_01.jpg.
3. Verify episode 002 resolves to the known cover https://www.tkkg-site.de/uploads/pics/002.jpg.
4. Test a later episode whose cover uses a different naming pattern.
5. Test non-image responses, missing files, generic avatars, empty images, and repeated candidate checks.
6. Test records 207–217 against fixtures containing Tumblr profile avatars, privacy notices, social links, and embed controls.
7. Test source merge precedence so invalid optional-source metadata cannot override valid official episode metadata.
8. Test official catalogue links against the observed direct-navigation behaviour. If no stable direct link exists, assert that the catalogue URL is retained.
9. Run the complete repository checks: Python tests, frontend tests, type checking, high-severity dependency audit, and production build.

## Live diagnostic
1. Run only after all automated checks pass and source access is verified.
2. Inspect episodes 001, 002, 207, 209, and 217 in the generated JSON and scrape report.
3. Verify each title and synopsis against permitted source pages.
4. Verify cover URLs return actual image content and are not generic avatars or HTML error pages.
5. Confirm Tumblr boilerplate is absent and robots restrictions remain respected.
6. Confirm schema and completeness validation pass and no partial catalogue is published.

## Official detail navigation
1. Open a representative product from the official catalogue.
2. Observe the URL before clicking the details arrow, immediately after clicking, and after reloading or opening the resulting URL in a new tab.
3. Repeat on a different catalogue page.
4. Record whether the individual details pane can be opened with a stable public URL. Do not infer support merely because the pane can be opened by clicking.

## Actual results
Not run. Waiting for approval before implementation.
