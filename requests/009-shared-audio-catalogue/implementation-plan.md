# Implementation plan: Shared TKKG audio catalogue

**Status:** Proposed; awaiting Oliver's explicit approval. Planning only. Do not implement before approval.

## 1. Baseline and constraints

1. Start from the current `main` branch and record the current catalogue size, schema validation result, scrape workflow state, and existing source-link coverage.
2. Read the project instructions, catalogue-source knowledge, current episode schema, scraper merge/export/validation flow, and the existing streaming-links request.
3. Keep `data/episodes.json` as the canonical shared dataset. Keep `data/episodes.csv` as a generated export, not a second source of truth.
4. Preserve the existing JSON top-level array and all current episode fields. Add only an optional field so older consumers can continue to ignore it.
5. Keep audio enrichment separate from the critical episode-discovery path. A YouTube Music or Spotify outage must not make the regular catalogue refresh fail.

## 2. Feasibility research and proof of concept

Before choosing dependencies or finalizing matching rules:

1. Test the current public YouTube Music playlist for episode 150:
   - Playlist ID: `OLAK5uy_mQRbJNANh1H4CKbmM5ez5LSW1HJFvE3QI`
   - Verify whether it can be retrieved without account cookies or user credentials.
   - Inspect the returned playlist title, creator or album artist, track titles, track order, track identifiers, and count.
2. Evaluate `ytmusicapi` as a discovery and metadata client. Its documentation exposes playlist search and playlist retrieval, but it is an unofficial interface that emulates YouTube Music web requests. Verify current behavior and access constraints before adding it as a dependency. Do not assume the interface is stable.
3. Determine how to find the Spotify album for each episode:
   - First investigate whether the existing episode-specific official `tkkg.lnk.to` listening destination exposes a Spotify album destination that can be extracted safely.
   - If that is insufficient, evaluate the same Spotify metadata resolution approach already used by TKKGDownloader and whether it can be reused without importing the full downloader or introducing a fragile dependency.
   - Do not introduce Spotify credentials, personal cookies, or a paid API requirement.
4. Verify spotDL's documented manual-pairing format against the installed version used by TKKGDownloader. The expected format is `YouTubeMusicURL|SpotifyAlbumURL`. Confirm that the episode 150 `OLAK5uy_` URL is accepted as an album-style playlist URL.
5. Test search queries using episode number and exact title, but treat search only as candidate discovery. Confirm that candidate identity and the complete track list are checked before a result is accepted.
6. Record any provider limits, regional differences, rate limits, robots or terms restrictions, and failure modes. If the available method cannot be used responsibly without authentication or bypassing access restrictions, stop and present the limitation rather than working around it.

## 3. Shared dataset contract

Add an optional `audio_release` object to each episode record. Keep the existing `listening_links` field separate: a listening destination is not necessarily the exact playlist required for track matching.

Proposed shape, subject to the feasibility findings:

```json
{
  "audio_release": {
    "spotify": {
      "album_id": "0ZqyFeMXxCyIJvYptGlnn1",
      "url": "https://open.spotify.com/album/0ZqyFeMXxCyIJvYptGlnn1",
      "title": "150/Heiße Nächte im Dezember",
      "track_count": 40,
      "source_url": "https://tkkg.lnk.to/example"
    },
    "youtube_music": {
      "playlist_id": "OLAK5uy_mQRbJNANh1H4CKbmM5ez5LSW1HJFvE3QI",
      "url": "https://music.youtube.com/playlist?list=OLAK5uy_mQRbJNANh1H4CKbmM5ez5LSW1HJFvE3QI",
      "title": "150 - Heiße Nächte im Dezember",
      "track_count": 40
    },
    "verification": {
      "status": "verified",
      "verified_at": "2026-11-09T00:00:00Z",
      "method": "episode_identity_and_tracklist",
      "matched_track_count": 40
    }
  }
}
```

The example illustrates the proposed contract, not a claim that every field has already been verified. Use the real episode 150 values only after the proof of concept confirms them.

Contract rules:

- `audio_release` is optional. Episodes without a verified pairing omit it or store null.
- A published `audio_release` represents a verified pairing only. Do not publish unverified search candidates as usable download sources.
- Provider IDs and URLs must agree. Validate HTTPS, expected hostnames, URL path or query ID, and supported ID formats.
- Track counts must be positive integers and must agree with the validated track records used during matching.
- `verification.verified_at` must be a timestamp. The method must identify the checks that were actually performed.
- Store the source/provenance used to resolve the Spotify album. Record the YouTube Music playlist as the source for its own metadata.
- Do not conflate the existing archive `tracks` field with Spotify album parts. They represent different concepts.
- Keep the schema permissive for episodes without Spotify or YouTube Music coverage, but strict for any object that claims to be verified.
- Document the contract and the public raw JSON URL so downstream tools can consume it without scraping TKKGtracker's website.

## 4. Discovery and matching component

Create a dedicated module, separate from the existing official and archive episode scrapers. Proposed responsibilities:

1. Read the already merged episode records.
2. Identify records with no verified `audio_release` object.
3. Resolve a Spotify album candidate using the proven method from the feasibility stage.
4. Search YouTube Music for playlist or album candidates using the episode number, title, and TKKG artist identity.
5. Retrieve candidate playlist metadata and tracks.
6. Reject candidates with conflicting episode numbers, titles, artist identity, implausible track counts, duplicate or missing part numbers, or incomplete track lists.
7. Compare Spotify and YouTube Music track lists in order. Normalize only harmless differences such as case, whitespace, punctuation, and standard part-number formatting. Do not remove meaningful words or accept a low-confidence fuzzy match.
8. Require a complete one-to-one match of the expected tracks before publishing the pairing. If alternate editions or bonus tracks make the comparison ambiguous, leave the episode unresolved for review.
9. Return verified enrichment records and structured diagnostics. Never let one episode's provider failure abort the batch.
10. Use conservative pacing, caching, bounded retries, and a per-run limit. Do not scrape individual track pages if playlist metadata already provides the necessary evidence.

For episode 150, derive the expected count from the actual validated track records returned by the metadata source. Do not trust the inconsistent Spotify `tracks_count` field by itself. The known 40-entry playlist is a regression case, not a hardcoded production count.

## 5. Persistence, merge, and reporting

1. Extend `schemas/episode.schema.json` with the optional `audio_release` object.
2. Extend `scraper/merge.py` so verified audio metadata survives future refreshes. An empty or failed enrichment must never erase a previously verified pairing.
3. Define conflict behavior explicitly. A new candidate must not silently replace an existing verified pairing. If provider IDs change or two verified sources conflict, preserve the current value and emit a diagnostic for review.
4. Extend `scraper/export.py` so the CSV contains the new object as JSON text, following the existing serialization pattern for arrays and objects.
5. Extend `scraper/validate.py` with provider URL/ID consistency, positive count, timestamp, and verification consistency checks.
6. Add an audio-coverage section to `data/scrape-report.json`, including:
   - total regular episodes;
   - episodes with verified Spotify and YouTube Music pairings;
   - episodes still missing a verified pairing;
   - candidates rejected as mismatched or ambiguous;
   - provider errors and rate-limit responses;
   - conflicts with previously verified mappings.
7. Keep the normal episode catalogue valid and publishable if the audio enrichment stage is unavailable. Report the enrichment failure separately.

## 6. Backfill and ongoing updates

Use a bounded process rather than searching all episodes on every weekly catalogue refresh.

- Add a command that can enrich a selected episode, a bounded episode range, or a limited number of currently missing records.
- Support a dry-run mode that reports candidates and verification outcomes without changing `episodes.json`.
- Run the initial historical backfill in explicit batches. The batch size must be chosen after measuring provider request volume and runtime.
- Add an incremental scheduled path for newly discovered episodes and records still missing audio metadata. Limit the number of episodes processed per run.
- Provide a manual GitHub Actions dispatch for controlled backfill batches. Do not commit partially verified candidates.
- Keep provider errors from affecting the existing successful catalogue publication. If the enrichment run fails, retain the last verified data.
- Record run timestamps and per-provider diagnostics. Do not claim full coverage until a complete audit demonstrates it.

The final workflow trigger and command options should follow the feasibility results and the measured request volume. Prefer a separate enrichment job or workflow over adding fragile provider dependencies to the core episode scrape path.

## 7. TKKGDownloader integration contract

This repository owns and publishes the dataset. The consumer change belongs in a coordinated follow-up in `OliverZsuffa/TKKGDownloader`.

Document the following contract:

1. Downloader fetches the published `episodes.json` dataset from the TKKGtracker GitHub Pages raw data URL.
2. It looks up the requested episode by `number`.
3. If `audio_release.verification.status` is `verified`, it passes the stored YouTube Music URL and Spotify album URL to spotDL using the documented manual-pairing format.
4. It validates the returned metadata and downloaded file count against the dataset's verified count.
5. If no verified pairing exists, downloader reports that the central dataset has no verified audio source for that episode. Any fallback to its old discovery logic must be explicit and temporary, not a second persistent mapping.
6. Downloader treats the dataset as read-only and never writes its own playlist IDs back to a separate catalogue.

Do not modify the TKKGDownloader repository as part of this TKKGtracker request. After the data contract is implemented and published, create the coordinated consumer request there.

## 8. Tests and quality gates

### Automated tests

- Saved fixtures for the episode 150 Spotify album metadata and YouTube Music playlist response.
- Search parser tests for no result, one candidate, multiple candidates, and wrong episode candidates.
- Playlist parsing tests for title, artist, ID, track order, duplicate parts, missing parts, unavailable entries, and track count.
- Track matching tests for exact matches, harmless punctuation/case differences, mismatched titles, alternate editions, and bonus tracks.
- Regression test proving episode 150 resolves to 40 validated tracks even if a provider's summary count says 25.
- Schema tests for valid verified records, missing fields, mismatched IDs and URLs, invalid hostnames, zero/negative counts, and invalid verification metadata.
- Merge tests proving a verified pairing survives empty enrichment, provider errors, and later regular catalogue refreshes.
- Conflict tests proving a changed candidate cannot silently overwrite an existing verified pairing.
- Export tests for JSON and CSV output.
- Failure-isolation tests proving audio lookup failures do not prevent the core episode catalogue from being written.
- Coverage-report tests for complete, partial, missing, rejected, and failed cases.
- Run all existing Python tests and frontend checks: `python -m unittest discover -s tests -v`, `npm run typecheck`, `npm test`, and `npm run build`.

### Manual verification

- Verify episode 150 end to end against the official playlist Oliver supplied.
- Test at least one early, one middle-era, and one recent episode.
- Inspect ambiguous candidates and confirm that none are saved as verified.
- Run a small dry-run batch and inspect the diagnostics and request pacing.
- Run a small write-enabled batch and verify the resulting JSON and CSV.
- Simulate provider unavailability and confirm that the core catalogue remains publishable and previous audio mappings remain intact.
- Fetch the published raw JSON URL and confirm the new field is available to downstream consumers.
- Confirm the documented spotDL pair is accepted by the installed TKKGDownloader spotDL version before opening the downstream integration request.

## 9. Sequence after approval

1. Create a focused implementation branch from the latest `main` and record baseline checks.
2. Complete the feasibility proof of concept and document the evidence and limitations.
3. Finalize the optional schema contract and add fixtures and validation tests.
4. Implement bounded discovery, matching, provenance, merge behavior, and reporting.
5. Add controlled backfill and incremental update workflow.
6. Backfill a small representative batch, review results, then expand only if matching quality is demonstrated.
7. Update generated JSON/CSV data only with verified pairings.
8. Run all quality gates, inspect the diff, and verify failure isolation.
9. Update the request notes, testing record, README or relevant knowledge documentation, and publish the dataset contract.
10. Leave the result ready for Oliver's review. Do not merge or deploy without explicit instruction.

## Guardrails

- Accuracy is more important than coverage.
- Never infer a playlist ID from an episode number or fabricate a URL.
- Never mark a result verified based on title similarity alone.
- Do not rely on Spotify's summary track count when the actual track records disagree.
- Do not bypass authentication, robots.txt, access controls, rate limits, or provider restrictions.
- Do not add personal credentials, cookies, tokens, or account data to the repository or GitHub Actions.
- Keep existing catalogue publication resilient to optional provider failures.
- Keep the central dataset canonical and downstream consumers read-only.
