# Notes: Fix archive release metadata extraction

## Initial investigation
- Current source parser: `scraper/sources/archive.py`, in `parse_archive_episode`.
- Current extraction uses regexes against `soup.get_text("\\n", strip=True)` and assumes the next flattened text line after each label is the corresponding value.
- The generated `data/episodes.json` currently shows the same shifted pattern for all 206 archive episodes. For example, episode 001 has `medium: "Label:"`, `label: "Erscheinungstermin:"`, `ean: "LP / MC / CD"`, and `release_date: "EAN:"`.
- All 206 archive records currently have null top-level `release_year` and `release_date`.
- The schema permits nullable top-level release date/year and stores physical-release date text separately. A top-level release date must be a complete ISO date; do not manufacture a date from a year alone.
- The exact archive DOM structure and correct values must be verified before selecting the replacement extraction strategy.

## Baseline audit
Initial programmatic inspection of the current generated JSON:
- Historical archive records checked: 206.
- Records with suspicious physical-release metadata: 206.
- Records with a non-null top-level release year: 0.
- The parser's current output needs source-by-source verification; do not assume every episode actually has an EAN or release date.

## Implementation and test outcomes
Pending approval. No source code, generated catalogue data, or deployment has been changed for this request.
