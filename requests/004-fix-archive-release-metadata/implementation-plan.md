# Implementation plan: Fix archive release metadata extraction

**Status:** Proposed; awaiting Oliver's explicit approval. No implementation or catalogue regeneration is authorized yet.

## 1. Establish the failure across the current dataset
- Read the source knowledge and current archive adapter, merge logic, schema, and existing source tests.
- Confirm the current generated-data baseline for all 206 archive episodes. The initial audit of `data/episodes.json` found that all 206 records have suspicious physical-release metadata, and all 206 have null top-level release year/date.
- Keep a short baseline summary in this request's notes. Do not manually edit generated catalogue values.

## 2. Inspect the real page structure
- Inspect the actual DOM around release metadata on episode 001, episode 002, and several later pages with differing available metadata.
- Determine whether values are associated through definition lists, table rows, sibling elements, attributes, or another stable structure. Do not assume a structure until verified.
- Compare the visible page labels and values with the flattened output from `soup.get_text("\\n", strip=True)` to explain exactly why the current expressions capture neighbouring labels or values.
- Identify which release fields the page actually exposes and how incomplete/older releases are represented.

## 3. Correct extraction in the archive adapter
- Replace the positional line-based regex extraction with a small, readable helper that associates each known label (`Medium`, `Label`, `Erscheinungstermin`, `EAN`) with its actual value using the verified DOM structure.
- Normalize whitespace and common formatting only; preserve meaningful identifiers such as EANs as strings, including leading zeroes.
- Reject empty values and label-like values. Do not infer an EAN from a medium name or infer an exact release date from a year alone.
- Store a physical release only when at least one genuine field value was found, and retain its source URL.
- Derive top-level `release_year` only from verified source-backed date/year evidence. Set top-level `release_date` only when a complete date can be represented in the schema's required ISO date format and its meaning matches the existing field. Otherwise leave it null and preserve source text in the physical-release record where appropriate.
- Keep the existing schema unless actual inspected evidence establishes a need for a schema change. Any material plan change requires approval first.

## 4. Regression and quality safeguards
- Add saved HTML fixtures for episode 001, episode 002, at least one later episode with a different metadata pattern, and a page with missing/partial release metadata.
- Add unit tests asserting field-to-value mapping, EAN string preservation, null behaviour for absent data, and rejection of label strings or shifted values.
- Add a catalogue-quality check for known label strings in physical-release values and for obviously invalid field assignments. Prefer a targeted, explainable check over a heuristic that rejects valid historical data.
- Test merge behaviour so a valid value from another permitted source is not overwritten by an empty or malformed archive value.

## 5. Regenerate and verify the catalogue
- Run focused tests first, then the complete Python test suite and existing validation.
- Run the normal catalogue refresh in a diagnostic/branch workflow; do not commit generated data or deploy before its output passes checks.
- Audit all 206 records programmatically for label contamination, field-value plausibility, EAN formatting, release-year coverage, and unexpected losses of existing data.
- Manually compare episodes 001, 002, and a varied sample of later episodes against their source pages. Include records where the source has no date/EAN so null values are not treated as failures.
- Verify episode count, uniqueness, numbering coverage, JSON schema, CSV export, source provenance, and existing catalogue completeness guard.
- Publish refreshed data and deploy only through the established workflows after successful validation and review.

## 6. Documentation
- Record actual tests and live observations in `testing.md` and implementation outcomes in `notes.md`.
- Update `docs/knowledge/catalogue-sources.md` only with verified, reusable facts about the archive's markup and extraction.
- Do not mark the request complete on Oliver's behalf.

## Approval gate
Wait for Oliver's explicit approval before implementing, regenerating published data, or deploying.
