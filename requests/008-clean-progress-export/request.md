# Request 008: Clean progress exports

## Problem
The JSON export currently includes every episode record touched in browser storage, even when an episode is unlistened and has no meaningful rating or note. Empty notes also appear in the export.

## Desired outcome
Export only meaningful personal progress while preserving the existing `tkkgtracker-progress/v1` format and all locally saved data.

## Acceptance criteria
- Include episodes marked as listened.
- Include unlistened episodes when they have a personal rating or a non-empty note.
- Omit empty, whitespace-only, or absent notes from exported records.
- Omit episodes that are unlistened and have neither a rating nor a meaningful note.
- Do not mutate or delete browser-stored progress.
- Keep import compatibility with existing v1 files.
- Add automated regression tests for these cases.
