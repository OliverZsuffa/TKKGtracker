# Notes: Shared TKKG audio catalogue

## Initial planning findings

- TKKGtracker currently publishes a single episode JSON array at `data/episodes.json`; `data/episodes.csv` is generated from the same records.
- The episode schema rejects unknown fields, so the new audio metadata must be explicitly added to the schema before it can be published.
- The scraper merge currently reconstructs episode records and only merges known fields. It must be extended so verified audio metadata is not lost on the next catalogue refresh.
- The current CSV export serializes list and object values as JSON text. The new optional field needs to be included in its field list.
- The current weekly catalogue workflow is responsible for regular episode discovery and publication. Audio discovery should be isolated from its critical path so provider outages cannot block normal catalogue updates.
- TKKGtracker already extracts official episode-specific Linkfire listening destinations. These should be investigated as a possible source of Spotify album links.
- spotDL documentation describes manual matching as a YouTube Music URL paired with a Spotify URL, separated by a pipe. Its documented support includes YouTube Music playlists and albums.
- ytmusicapi documents playlist search and playlist retrieval, but is an unofficial client. Its stability and access constraints need to be tested before a dependency is approved.
- The episode 150 test case has a known YouTube Music playlist ID and 40 playlist entries. The Spotify metadata summary count was inconsistent, so actual validated track records must determine the count.

## Initial design direction

Keep the existing `episodes.json` as the canonical shared dataset. Add an optional `audio_release` object for verified Spotify and YouTube Music pairings. Keep official listening hubs in `listening_links`, because those links and exact downloadable album/playlist sources serve different purposes.

The TKKGtracker request will define and publish the data contract. TKKGDownloader will consume it read-only in a separate coordinated request after the contract is implemented.

## Status

Planning only. No scraper code, schema, generated data, workflow, or downloader code has been changed.
