# Request 005: Recover official episode years from copyright credits

## Problem

Newer episodes sourced from the official TKKG catalogue have `release_date` and `release_year` set to `null`, even though the final line in the episode's Details section often includes a copyright year. For example, episode 224, *Bilderdiebe haben kein Gesicht*, ends with `© 2022 - Eine Produktion der Sony Music Entertainment Germany GmbH`.

## Expected behaviour

When the official page does not provide an explicit release date, use a year in the copyright line as a fallback for `release_year`. Do not infer an exact `release_date` from a copyright year. Explicit publication dates, where present, remain higher priority.

## Scope

- Parse the copyright year from the official listing's Details section.
- Apply the same fallback to verified official detail-page fallbacks where relevant.
- Add regression tests, including the example copyright line for episode 224 and precedence for an explicit publication date.
- Refresh the catalogue, inspect official records for missing years, and verify the live deployment.
