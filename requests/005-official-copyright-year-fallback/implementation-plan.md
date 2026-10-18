# Implementation plan: Official copyright-year fallback

## Diagnosis

The official listing parser currently calls `_base_record(... release_date=None, release_year=None ...)` for every episode in the listing, despite parsing the episode's `Details` section for credits. The copyright line is therefore discarded. The verified detail-page parser only recognises an explicit `Veröffentlichungsdatum` and also ignores a copyright year when that field is absent.

## Proposed changes

1. Add a small, focused helper in `scraper/sources/official.py` that extracts a four-digit year from the copyright line (for example, `© 2022 - Eine Produktion der Sony Music Entertainment Germany GmbH`) in the episode's Details section.
2. For the official listing parser, keep `release_date=None` unless a genuine explicit release date is available, and populate `release_year` from the copyright year when no stronger release-year evidence exists.
3. For verified official detail pages, preserve the existing explicit `Veröffentlichungsdatum` parsing and use the copyright year only as a fallback when no explicit date is present.
4. Add tests for a listing episode whose Details section ends in a copyright line, for episode 224's 2022 example, and for the rule that an explicit publication date takes precedence over the copyright year.
5. Run the complete test/type-check/build workflow, refresh and validate the catalogue, audit official episodes for missing years, and confirm deployment completes.

## Data semantics

- A copyright year populates `release_year` only; it must not be formatted as an exact `release_date`.
- Do not overwrite a real release date or year with the copyright year.
- If no copyright year or explicit publication date exists, leave the year unknown rather than guessing.

## Approval gate

No implementation changes are made until this plan is approved.
