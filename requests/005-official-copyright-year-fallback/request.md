# Request 005: Recover official episode years and fix archive speaker-footer pollution

## Problem A: Missing official episode years

Newer episodes sourced from the official TKKG catalogue have `release_date` and `release_year` set to `null`, even though the final line in the episode's Details section often includes a copyright year. For example, episode 224, *Bilderdiebe haben kein Gesicht*, ends with `© 2022 - Eine Produktion der Sony Music Entertainment Germany GmbH`.

## Expected behaviour A

When the official page does not provide an explicit release date, use a year in the copyright line as a fallback for `release_year`. Do not infer an exact `release_date` from a copyright year. Explicit publication dates, where present, remain higher priority.

## Problem B: Archive footer links become Kommissar Krause's cast credits

Episode 206, *Achtung, UFO-Kult!*, has unrelated footer/navigation links appended to its speaker list. The parser treats every link found after the `Sprecher` heading and before the next heading as a cast member, so site navigation such as “TKKG-Site.de-Archiv”, “Blog”, “Forum”, “Datenschutz”, and “Impressum” is incorrectly attributed to the character Kommissar Krause. This makes it look as if he voices the entire website.

## Expected behaviour B

Only extract cast members from the actual speaker-list structure/content. Footer, navigation, related links, and page utility links must never become cast credits. Preserve the genuine cast entries, including the real Kommissar Schalavsky credit.

## Scope

- Parse copyright years from the official listing's Details section and apply the fallback to verified official detail-page fallbacks where relevant.
- Keep a copyright year in `release_year` only; do not invent an exact release date.
- Constrain archive cast extraction to the actual speaker section/list and exclude site navigation/footer links.
- Add regression tests for episode 224's 2022 copyright line, explicit-date precedence, and a speaker section followed by footer/navigation links like episode 206.
- Refresh the catalogue, inspect official records for missing years, audit archive cast entries for navigation pollution, and verify the live deployment.
