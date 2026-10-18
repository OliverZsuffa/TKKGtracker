# Implementation plan: Copyright-year fallback and archive cast boundary fix

## Part A: Official copyright-year fallback

### Diagnosis

The official listing parser currently calls `_base_record(... release_date=None, release_year=None ...)` for every episode in the listing, despite parsing the episode's `Details` section for credits. The copyright line is therefore discarded. The verified detail-page parser only recognises an explicit `Veröffentlichungsdatum` and also ignores a copyright year when that field is absent.

### Proposed changes

1. Add a focused helper in `scraper/sources/official.py` that extracts a four-digit year from the copyright line (for example, `© 2022 - Eine Produktion der Sony Music Entertainment Germany GmbH`) in the episode's Details section.
2. For the official listing parser, keep `release_date=None` unless a genuine explicit release date is available, and populate `release_year` from the copyright year when no stronger release-year evidence exists.
3. For verified official detail pages, preserve the existing explicit `Veröffentlichungsdatum` parsing and use the copyright year only as a fallback when no explicit date is present.

## Part B: Keep archive footer/navigation links out of the cast

### Diagnosis

In `scraper/sources/archive.py`, cast extraction starts at the `Sprecher` heading and scans all subsequent descendants until the next heading, collecting every anchor (`a`). On episode 206 the archive's footer/navigation appears in that traversal before a later heading boundary, so navigation links are misattributed as cast members, inheriting the previous character label.

### Proposed changes

4. Inspect the episode 206 HTML structure/fixture and constrain cast extraction to the actual speaker content container or semantic list (e.g. the relevant `dl`/list/paragraph rows) rather than every link in the page region. Use DOM structure, not hard-coded blocked link names, so unrelated navigation is excluded generally.
5. Preserve the real speaker names and character associations, including the actual Kommissar Schalavsky entry. Do not infer speakers from page-footer links or navigation text.
6. Add a regression fixture representing the speaker list followed by footer/navigation links like the reported episode 206 data. Assert that genuine cast entries remain and entries such as “Impressum”, “Datenschutz”, “Blog”, “Forum”, “nach oben”, and “Startseite” never appear as cast members.

## Tests and validation

7. Add tests for a listing episode whose Details section ends in a copyright line, episode 224's `© 2022` example, and explicit publication-date precedence over the copyright year.
8. Run the complete test/type-check/build workflow.
9. Refresh and validate the catalogue. Audit official episodes for missing years and archive cast entries for navigation pollution, especially episode 206.
10. Confirm the live deployment completes and inspect the deployed catalogue.

## Data semantics

- A copyright year populates `release_year` only; it must not be formatted as an exact `release_date`.
- Do not overwrite a real release date or year with the copyright year.
- If no copyright year or explicit publication date exists, leave the year unknown rather than guessing.
- Cast data must reflect actual speaker credits only; page navigation and footer links are never people/roles.

## Approval gate

No implementation changes are made until this combined plan is approved.
