# Implementation plan: Fix covers and source detail quality

**Status:** Awaiting explicit approval. Investigation and documentation only so far.

## Goal
Correct archive cover discovery, prevent invalid Tumblr/embed content from contaminating episode records 207–217, and improve official source links only where the site's real navigation supports it.

## 1. Establish a focused baseline
- Read docs/knowledge/ and relevant request 002 notes before changing implementation.
- Inspect the current archive parser, official parser, source orchestration, merge precedence, validation, frontend cover rendering, and existing fixtures.
- Inspect the latest catalogue/report artifact and trace representative records 1, 2, 207, 209, and 217 through source extraction and merge.
- Record each record's title, synopsis, cover URL, source URLs, and which adapter supplied each field.
- Do not treat a currently displayed record as proof that the source still produces it; identify the exact current data path.

## 2. Correct archive cover discovery
- Inspect the actual HTML and image attributes for archive episodes 001, 002, and a varied sample of later episodes.
- Confirm whether the page exposes the intended cover in src, data-src, srcset, structured metadata, or another explicit attribute.
- Treat the supplied image URLs as verified examples, not as a universal filename formula.
- Prefer an explicit image URL grounded in the episode page. If filename discovery is needed, generate only a small, documented set of candidates based on verified patterns, then verify image responses and image content types before accepting them.
- Avoid downloading full images when a bounded HEAD or small GET check is sufficient and permitted. If HEAD is unsupported, use a bounded GET with streaming or a small byte range only if the server supports it.
- Cache successful and failed checks within a run, set conservative timeouts, and limit retries and candidate counts. Never probe an unbounded sequence of filenames.
- Reject empty responses, non-image responses, error pages returned with status 200, and known generic/profile images. Do not accept a candidate based solely on HTTP 200.
- Define deterministic fallback behaviour: keep a valid existing cover when provenance is sound, otherwise leave cover null rather than attach an unrelated image.
- Add fixture-based tests for the two known examples, inconsistent naming, invalid status/content type, generic avatar rejection, and absent cover.

## 3. Trace and eliminate Tumblr metadata contamination for 207–217
- Inspect source discovery and merge ordering to establish why the Tumblr post URL is retained as a source and why its page title, avatar, privacy text, and social links populate the record.
- Compare the live merged records with the official catalogue records for episodes 207–217. Confirm each episode number and title from source evidence rather than deriving the number from unrelated page text.
- Keep the audio.tkkg-site.de robots.txt HTTP 403 handling fail-closed. Do not fetch or parse its posts to work around that restriction.
- Use the permitted official catalogue for episode metadata in this range. Fix the relevant adapter or merge rule so a disallowed/optional source cannot override valid official episode metadata.
- Add parser and merge regression fixtures that include a Tumblr avatar URL, privacy boilerplate, social navigation, and a misleading page title. Verify these fields are not accepted as episode metadata.
- Preserve source provenance accurately and report source restrictions clearly. Do not silently relabel Tumblr content as official catalogue content.

## 4. Investigate official catalogue detail links
- Inspect the real markup and JavaScript for the arrow control and its data-modal relationship to the collapsed details panel.
- Check whether clicking the control changes the URL through a fragment or query parameter, and whether direct navigation to that resulting URL opens the same product pane after reload.
- Test a representative product from more than one catalogue page.
- If there is a stable, public, repeatable URL that opens the correct pane, store that URL as the source link and add tests.
- If opening the pane depends only on in-page JavaScript and no stable direct URL exists, keep the catalogue URL. Do not invent a fragment or query parameter or add brittle client-side automation.

## 5. Tests and validation
- Add unit tests for cover candidate generation and validation, archive image extraction, Tumblr boilerplate rejection, source precedence, and direct-link behaviour.
- Run Python tests, frontend tests, type checking, high-severity dependency audit, and production build.
- Run a live diagnostic only after automated checks pass and source access rules are confirmed.
- Inspect the generated report and records 001, 002, 207, 209, and 217. Verify correct title, synopsis, cover, and source attribution.
- Validate schema, unique episode numbers, expected coverage, and no gaps. Keep the existing incomplete-catalogue guard unchanged.
- Do not commit generated catalogue data or deploy until validation passes. Verify the production workflow and public app separately if a deployment is part of the approved workflow.

## 6. Documentation
- Record exact implementation decisions and test outcomes in testing.md and notes.md.
- Update reusable knowledge only for durable, verified source behaviour. Keep request-specific observations in this request folder.

## Approval gate
No code, scraper behaviour, generated data, or deployment changes are authorized until Oliver explicitly approves this plan.
