# Implementation plan: Clean progress exports

**Status:** Approved by Oliver in the conversation on 18 October 2026.

## Scope
Make export output concise without changing local storage or the v1 import format.

## Approach
1. Add a pure `cleanProgressForExport` transformation in `src/storage.ts`.
2. Retain listened episodes, and retain unlistened episodes only if they have a rating or a non-empty note.
3. Trim notes only to determine whether they are empty. Preserve the user's original text for meaningful notes.
4. Build the exported payload from the cleaned copy, leaving the input and browser storage untouched.
5. Add regression tests in `src/storage.test.ts`.
6. Run typecheck, test suite, and production build if the available environment permits. Record accurately which checks were actually run.

## Compatibility
Keep `tkkgtracker-progress/v1`, current JSON envelope, and import behaviour unchanged. No dependencies or UI changes.
