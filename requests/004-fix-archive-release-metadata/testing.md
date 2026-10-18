# Testing: Fix archive release metadata extraction

**Status:** Planned only. No implementation checks have been run for this request.

## Automated tests
1. Add and run focused archive parser tests for episode 001's observed release metadata markup.
2. Test episode 002 and at least one later episode with a different or partial metadata layout.
3. Assert that `Medium:`, `Label:`, `Erscheinungstermin:`, and `EAN:` are never returned as field values.
4. Assert that a medium such as `LP / MC / CD` is not misclassified as an EAN.
5. Assert EANs remain strings and retain leading zeroes.
6. Test missing labels, missing values, multiple physical-release formats if present, and incomplete dates.
7. Test year extraction only when supported by the source and keep top-level `release_date` null unless a complete ISO date is supported.
8. Test merge behaviour for malformed, empty, and valid values from different permitted sources.
9. Run the full Python test suite and catalogue/schema validation.

## Full catalogue diagnostic
1. Regenerate catalogue data on a diagnostic branch/workflow, not directly on the published branch.
2. Audit all archive episodes 001–206 for label contamination and field-shift patterns.
3. Compare episodes 001, 002, and a varied sample of later episodes with their source pages.
4. Check episodes without source-provided EANs or release dates to confirm unknown values remain null.
5. Verify episode count, unique numbering, no unexpected gaps, JSON schema, CSV export, provenance, and preservation of unrelated fields.
6. Review the scrape report for warnings and ensure the completeness guard still prevents publishing an incomplete catalogue.

## Manual tests
1. Open the published app after a successful approved deployment and inspect episode 001's release details. Expected: labels are displayed as labels, not as values; unavailable information is shown as unknown/omitted.
2. Inspect episode 002 and at least three later episodes selected from the diagnostic audit. Expected: displayed medium, label, EAN, and release information match their cited archive pages.
3. Inspect an episode whose source has no EAN or release date. Expected: the app does not invent one.
4. Open the generated JSON and CSV. Expected: the same corrected values are present in both exports.

## Actual results
Not run. Waiting for approval before implementation.
