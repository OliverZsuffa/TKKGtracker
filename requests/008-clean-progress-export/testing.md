# Manual testing: Clean progress exports

## Steps
1. In the tracker, mark an episode listened, then unlisten it without adding a rating or note.
2. Add a note to an unlistened episode, then clear it or replace it with whitespace.
3. Keep a rating on an unlistened episode.
4. Keep a listened episode with a rating and a meaningful note.
5. Export progress and inspect the JSON file.
6. Reload the app and confirm the original local progress remains unchanged.
7. Import a previously generated `tkkgtracker-progress/v1` export.

## Expected results
- Unlistened episodes with no rating and no meaningful note are absent from the export.
- Empty and whitespace-only notes are absent from exported records.
- Ratings and meaningful notes remain exportable even if the episode is unlistened.
- Listened episodes remain included.
- Existing local data is not cleaned or deleted by exporting.
- Older v1 exports remain importable.

## Oliver's observations
Not yet recorded.
