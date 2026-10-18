# Browser progress storage

## Storage and import/export

- Personal episode progress is stored locally in the browser under `tkkgtracker.progress.v1`. It is separate from the shared scraped catalogue.
- Export files use the `tkkgtracker-progress/v1` envelope with an export timestamp and a progress map. Keep this format stable for existing imports.
- Export cleanup is a pure transformation. It must not modify or delete the browser's saved progress.
- Include every listened episode. Also include unlistened episodes if they have a personal rating or a non-empty note.
- Omit empty or whitespace-only notes from exported records. Omit unlistened records that have neither a rating nor a meaningful note.
- Preserve the original text of meaningful notes rather than trimming the user's content.
