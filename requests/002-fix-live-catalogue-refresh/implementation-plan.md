# Implementation plan: Fix live catalogue refresh

**Status:** Awaiting approval

## 1. Reproduce and diagnose from the recorded failure
- Inspect the uploaded `scrape-report.json` and workflow logs.
- Confirm the duplicated path in archive detail URLs and trace it to the URL-joining base.
- Inspect official-source records around episode number 500 and determine whether the parser is reading a real main-series episode, a bundle/special, a heading from unrelated page content, or malformed markup.
- Do not relax the minimum episode count or gap checks to make the workflow green.

## 2. Correct archive URL construction
- Normalize archive links against the source origin and account for both absolute, root-relative, and site-root-relative hrefs.
- Add focused unit tests for the exact forms seen in source markup and the failing duplicated-path case.
- Keep source-host boundaries explicit; do not turn arbitrary external links into archive detail URLs.

## 3. Harden official catalogue discovery
- Add diagnostic details for suspicious/out-of-range episode numbers and source URLs/titles.
- Determine why episode 500 is included before choosing a filter. Implement only a rule supported by the inspected page structure and fixtures.
- Ensure the episode count and maximum-number checks operate on validated regular main-series records, not just any matching heading.
- Add regression tests using a fixture that reproduces the observed false positive.

## 4. Improve scrape reporting
- Preserve source counts, gaps, conflicts, warnings, and fatal errors.
- Include enough record-level context to diagnose rejected or suspicious entries without dumping full page contents.
- Keep the report artifact available even when the scrape fails.

## 5. Maintain GitHub Actions
- Check maintained versions and runtime compatibility for checkout, setup-python, setup-node, upload-artifact, upload-pages-artifact, and deploy-pages.
- Update action versions together and retain least-privilege workflow permissions.
- Decide whether to pin Ubuntu to a named supported runner or deliberately validate Ubuntu 26. Avoid relying on `ubuntu-latest` migration notices without testing.
- Preserve the sequencing rule: deployment after a catalogue refresh only when the refresh succeeds.

## 6. Verify
- Run Python unit tests.
- Run frontend type checking, tests, dependency audit, and production build.
- Run the live catalogue refresh manually and inspect its artifact/report.
- Confirm JSON/CSV are updated only after validation passes.
- Verify the subsequent Pages deployment and inspect the site for a populated episode list.
- Update `testing.md`, `notes.md`, and reusable knowledge with observed outcomes only.

## Approval gate
No scraper/workflow code changes will be made until Oliver explicitly approves this plan.
