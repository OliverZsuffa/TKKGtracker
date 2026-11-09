# Request 009: Shared TKKG audio catalogue

## Status
Awaiting approval. Planning only. No scraper, schema, catalogue, or downloader implementation is authorized yet.

## Desired outcome
Create one central, machine-readable TKKG dataset in TKKGtracker that records verified Spotify album and YouTube Music playlist identifiers for each regular main-series episode. TKKGtracker discovers and maintains this information. TKKGDownloader and future tools consume the published dataset instead of maintaining their own independent episode-to-playlist mappings or repeatedly searching for sources.

## Context
TKKGtracker already publishes `data/episodes.json` and `data/episodes.csv` from its scraper. The JSON catalogue is available to downstream tools through the GitHub Pages raw catalogue URL.

TKKGDownloader currently resolves Spotify album metadata itself. Its first successful manual test for episode 150 identified the Spotify album, but spotDL's normal YouTube Music text matching failed for many tracks. Oliver found the official YouTube Music playlist for episode 150 and confirmed that every episode has its own playlist.

spotDL supports manually pairing a YouTube Music playlist or album URL with a Spotify album URL using the `YouTubeMusicURL|SpotifyURL` format. The shared catalogue should store these verified identifiers so the downloader can use that pairing directly.

Relevant existing work:
- TKKGtracker catalogue schema: `schemas/episode.schema.json`
- TKKGtracker scraper and merge: `scraper/run.py`, `scraper/merge.py`
- Existing streaming-link data: `listening_links`
- TKKGDownloader: https://github.com/OliverZsuffa/TKKGDownloader
- spotDL manual matching documentation: https://spotdl.github.io/spotify-downloader/usage/
- ytmusicapi documentation: https://ytmusicapi.readthedocs.io/en/stable/

## Required behaviour
1. TKKGtracker automatically discovers the Spotify album and corresponding official YouTube Music playlist for regular main-series episodes.
2. Discovery verifies that both sources refer to the same episode and that their track lists correspond before marking the pairing as verified.
3. Verified identifiers and useful verification metadata are stored directly in each episode record in the existing central `episodes.json` dataset.
4. The existing episode catalogue remains the canonical dataset. Do not create a separate playlist database that downstream tools must keep in sync.
5. The regular episode scraper must still publish valid episode metadata when an audio-source lookup fails. Audio discovery is optional enrichment, not a reason to discard an otherwise valid catalogue refresh.
6. Previously verified audio metadata must survive ordinary catalogue refreshes and temporary source failures.
7. The dataset contract must be documented for TKKGDownloader and other consumers. A coordinated follow-up in TKKGDownloader will replace its independent source discovery with read-only consumption of the central dataset.
8. Discovery must be safe to rerun. It must not silently replace a verified mapping with an ambiguous or weaker candidate.

## Scope

### Included
- Research and test a suitable public YouTube Music discovery and playlist-metadata method.
- Research how to obtain reliable Spotify album identifiers from the existing official TKKG listening links or other supported metadata sources.
- Define an optional, validated audio-release object in the existing episode schema.
- Add a dedicated audio-enrichment component and a bounded backfill workflow or command.
- Match Spotify and YouTube Music track lists using episode identity, track titles, artists, ordering, and track counts where available.
- Preserve provenance, verification timestamps, and unresolved or ambiguous results in the scrape report.
- Extend merge logic, CSV export, schema validation, tests, and project documentation.
- Publish the enriched records in the existing `episodes.json` dataset.
- Document the exact read-only data contract that TKKGDownloader will consume.

### Not included
- Implementing the TKKGDownloader consumer changes in this repository. That will be a coordinated follow-up in the TKKGDownloader repository after the data contract is approved and published.
- Downloading or merging audio in TKKGtracker.
- Storing audio files, credentials, cookies, or personal account data.
- Adding a backend, database service, or a second independently maintained playlist catalogue.
- Changing TKKGtracker's listening-progress storage or user interface unless a later request establishes a clear need.
- Bypassing robots.txt, authentication, access controls, rate limits, or platform restrictions.
- Treating a search result as verified merely because its title looks similar.

## Acceptance criteria
- [ ] The existing `episodes.json` remains the single canonical episode dataset and remains backward compatible for consumers that ignore the new optional field.
- [ ] The episode schema defines and validates an optional audio-release object containing Spotify album and YouTube Music playlist identifiers, canonical URLs, track counts, and verification metadata.
- [ ] Automated discovery can find candidates for an episode without requiring a manually supplied playlist URL.
- [ ] A candidate is marked verified only after strict episode identity and track-list checks pass.
- [ ] Episode 150 is covered by a saved regression fixture representing the known Spotify album and official YouTube Music playlist, including the observed 40 playlist entries.
- [ ] The inconsistent Spotify `tracks_count` value observed for episode 150 is not treated as authoritative when the actual returned track records establish a different count.
- [ ] Ambiguous, incomplete, mismatched, private, unavailable, or failed candidates are reported and are not published as verified mappings.
- [ ] Existing verified mappings survive refreshes when discovery fails or returns no candidate.
- [ ] Audio enrichment failures do not prevent publication of an otherwise valid episode catalogue.
- [ ] The CSV export includes the optional audio-release data without changing existing columns' meanings.
- [ ] Tests cover discovery, track matching, validation, merge preservation, partial failures, and report output.
- [ ] A bounded initial backfill and an incremental update process are documented and do not issue an unbounded burst of requests.
- [ ] TKKGDownloader's read-only integration contract is documented with a concrete example and the public dataset URL.
- [ ] Existing Python tests, frontend type checks, frontend tests, and production build pass.
- [ ] A live audit reports verified coverage, unresolved episodes, and any source limitations without claiming complete coverage unless demonstrated.

## Open questions
- Which supported method can discover public YouTube Music playlists reliably without user authentication, and what are its stability and access-policy limitations?
- Can Spotify album IDs be extracted consistently from the official TKKG Linkfire episode destinations, or is a separate public metadata lookup needed?
- Should the initial backfill be run in bounded batches through GitHub Actions, locally, or both?
- What strict track-match threshold is appropriate for albums with alternate editions, bonus tracks, or inconsistent track titles?
