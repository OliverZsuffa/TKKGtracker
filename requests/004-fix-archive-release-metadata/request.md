# Request: Fix historical archive release metadata extraction

## Status
Awaiting approval

## Desired outcome
Correctly extract release metadata from the TKKG-Site archive pages for episodes 001–206 without assigning labels or neighbouring field values to the wrong fields.

## Context
The current generated catalogue has the same obvious extraction failure across all 206 historical archive records. For example, episode 001 currently has `medium: "Label:"`, `label: "Erscheinungstermin:"`, `ean: "LP / MC / CD"`, and `release_date: "EAN:"`. Top-level `release_year` and `release_date` are null. The parser in `scraper/sources/archive.py` currently extracts these fields with regular expressions over `soup.get_text("\\n", strip=True)`, assuming the next text line is the value.

Relevant reusable findings: [catalogue source knowledge](../../docs/knowledge/catalogue-sources.md), [archive source adapter](../../scraper/sources/archive.py), and the generated catalogue at `data/episodes.json`.

## Required behaviour
- Read each field from its actual label/value structure in the page, rather than assuming the next flattened text line is its value.
- Never store field labels such as `Label:`, `EAN:`, or `Erscheinungstermin:` as field values.
- Extract EAN, medium, label, and release information only when supported by the source page.
- Populate the top-level release year only when a year can be reliably derived from source-backed release information. Leave genuinely unavailable information null.
- Preserve source URLs and existing valid unrelated fields such as title, synopsis, cover, tracks, and cast.
- Regenerate and validate all archive records 001–206 so the already-published catalogue is corrected, not merely future runs.

## Scope
### Included
- Inspect archive page markup and the current parser behaviour for episode 001, episode 002, and a varied sample of later episodes.
- Fix archive release metadata extraction and add regression tests using saved HTML fixtures.
- Add validation or quality checks that detect label strings or clearly invalid field values in release metadata.
- Regenerate the catalogue through the existing controlled workflow and inspect representative and aggregate results.
- Update request documentation and reusable source knowledge if the inspected markup establishes a durable extraction rule.

### Not included
- Rewriting unrelated title, synopsis, track, cast, cover, or official-catalogue extraction.
- Guessing release dates or EANs when the source does not provide them.
- Changing the public data schema unless inspection proves it is necessary and a plan change is approved.
- Bypassing source access restrictions or adding a new scraping dependency.

## Acceptance criteria
- [ ] Episode 001 no longer has label names or medium values assigned to the wrong fields.
- [ ] Episodes 002 and a varied sample of later archive episodes extract release fields correctly according to their source markup.
- [ ] No label text such as `Medium:`, `Label:`, `Erscheinungstermin:`, or `EAN:` is stored as a metadata value in archive records.
- [ ] EANs are only stored when the source actually provides an EAN; medium names are stored as medium, not EAN.
- [ ] Release year is populated only from verified source evidence and remains null when no reliable year exists.
- [ ] Regression tests cover the observed markup and missing/partial metadata.
- [ ] The full test suite and catalogue validation pass.
- [ ] The regenerated 001–206 data is checked for aggregate field-quality regressions before it can replace the published catalogue.
- [ ] Existing source provenance and unrelated episode data are preserved.

## Manual testing
See [testing.md](testing.md).

## Reference material
- [Episode 001 archive page](https://www.tkkg-site.de/de/hoeren/hoerspiele/serie/folge-001/inhalt.html)
- [Episode 002 archive page](https://www.tkkg-site.de/de/hoeren/hoerspiele/serie/folge-002/inhalt.html)

## Open questions
None at planning stage. If inspection reveals that the site uses materially different markup patterns across episodes, document them and adjust the plan before implementation if the scope changes.
