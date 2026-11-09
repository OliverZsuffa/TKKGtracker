# Shared audio source catalogue

## Canonical data

The episode array in `data/episodes.json` remains the canonical shared TKKG dataset. Audio metadata is an optional `audio_release` object on an episode. The generated CSV includes this object as JSON text. Existing `listening_links` remain official listening hubs and are not interchangeable with exact Spotify album or YouTube Music playlist URLs.

## Verified audio object

An audio object is published only after the Spotify album and YouTube Music playlist are both identified and their complete ordered track titles match exactly after conservative Unicode, case, and punctuation normalization.

- `spotify.album_id`, `spotify.url`, `spotify.title`, `spotify.track_count`, and `spotify.source_query`
- `youtube_music.playlist_id`, `youtube_music.url`, `youtube_music.title`, and `youtube_music.track_count`
- `verification.status`, `verification.verified_at`, `verification.method`, and `verification.matched_track_count`

The three track counts must agree. IDs must agree with their corresponding URLs. The schema rejects unverified status values and unknown fields.

## Discovery

Run `python -m scraper.audio_enrichment --episode 150` for a dry run. Use `--write` only when verified results should be written to `data/episodes.json` and `data/episodes.csv`. Without an episode selector, `--limit N` processes at most N episodes that do not already have verified audio metadata.

Spotify metadata is resolved using spotDL's metadata save operation. YouTube Music candidates are searched using `ytmusicapi`, then their public playlist track lists are retrieved. A result is rejected if the title, TKKG artist evidence, track count, or ordered track titles do not match. Multiple fully matching candidates are treated as ambiguous.

The current matching rule is intentionally conservative. It does not attempt fuzzy matching, alternate-edition selection, or automatic acceptance of bonus tracks. Such episodes remain unresolved for review.

## Provider limitations

`ytmusicapi` is an unofficial client that emulates public YouTube Music web requests. It is not supported or endorsed by Google and can break when the service changes. The discovery workflow uses unauthenticated public access and does not store browser cookies or account credentials. No authentication, access controls, or rate limits are bypassed.

spotDL reads Spotify metadata and uses the paired YouTube Music URL as the audio source. Its documented manual pairing format is `YouTubeMusicURL|SpotifyAlbumURL`. The downloader integration must confirm this against its installed spotDL version before relying on the dataset in production.

## Backfill and scheduled discovery

A weekly GitHub Actions run processes at most five highest-numbered episodes that do not yet have verified mappings. It writes only fully verified pairings. Manual workflow dispatch supports a specific episode or a bounded batch for historical backfill. The default manual mode is dry-run.

## Preservation

The normal episode scraper loads the previous catalogue and carries forward verified audio objects. Empty enrichment, provider failures, or changed mappings do not silently erase or replace an existing verified object. Conflicts are reported for review. The regular episode scrape remains independent of optional audio discovery.

## Downstream consumers

TKKGDownloader should fetch the published `episodes.json`, look up an episode by `number`, and use `audio_release` only when `verification.status` is `verified`. It should pass the YouTube Music URL and Spotify album URL to spotDL in the documented pipe-separated format. Consumers are read-only and must not maintain separate playlist mappings.
