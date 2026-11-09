from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
import time
import unicodedata
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from scraper.export import write_catalogue
from urllib.parse import urlencode


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
CATALOGUE_PATH = DATA_DIR / "episodes.json"
REPORT_PATH = DATA_DIR / "audio-enrichment-report.json"
YTM_BASE = "https://music.youtube.com/playlist?"
SPOTIFY_ALBUM_BASE = "https://open.spotify.com/album/"
SPOTDL_TIMEOUT_SECONDS = 180


def _normalise(value: str) -> str:
    value = unicodedata.normalize("NFKC", value).casefold()
    value = re.sub(r"^\s*tkkg\s+", "", value)
    value = re.sub(r"[^\w]+", " ", value, flags=re.UNICODE)
    return " ".join(value.split())


def _spotdl_command() -> list[str]:
    executable = shutil.which("spotdl")
    if executable:
        return [executable]
    try:
        import importlib.util
        if importlib.util.find_spec("spotdl"):
            return [sys.executable, "-m", "spotdl"]
    except (ImportError, ValueError):
        pass
    raise RuntimeError(
        "spotDL is not installed. Install the optional audio requirements "
        "with: pip install -r requirements-audio.txt"
    )


def _save_spotify_metadata(query: str, output_path: Path) -> list[dict[str, Any]]:
    command = [
        *_spotdl_command(), "save", query, "--save-file", str(output_path),
        "--max-retries", "2",
    ]
    try:
        result = subprocess.run(
            command, capture_output=True, text=True, timeout=SPOTDL_TIMEOUT_SECONDS,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError(f"spotDL timed out while resolving {query!r}.") from exc
    if result.returncode != 0:
        detail = (result.stderr or result.stdout or "").strip()
        raise RuntimeError(
            f"spotDL failed for {query!r} with exit code {result.returncode}: "
            f"{detail[-1200:]}"
        )
    try:
        payload = json.loads(output_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"spotDL did not create valid metadata for {query!r}: {exc}") from exc
    if not isinstance(payload, list) or not payload or not all(isinstance(item, dict) for item in payload):
        raise RuntimeError(f"spotDL returned no usable track records for {query!r}.")
    return payload


def _artist_names(record: dict[str, Any]) -> list[str]:
    artists = record.get("artists")
    if isinstance(artists, list):
        return [str(item) for item in artists if isinstance(item, (str, int, float))]
    artist = record.get("artist")
    return [str(artist)] if isinstance(artist, str) else []


def resolve_spotify_album(episode: dict[str, Any], work_dir: Path) -> dict[str, Any]:
    number = int(episode["number"])
    title = str(episode["title"])
    first_track_query = f"TKKG {number:03d} {title} Teil 01"
    first_track_file = work_dir / "spotify-first-track.spotdl"
    first_tracks = _save_spotify_metadata(first_track_query, first_track_file)
    if len(first_tracks) != 1:
        raise ValueError(
            f"Expected one Spotify first-track result, received {len(first_tracks)}."
        )
    first = first_tracks[0]
    if not any(name.strip().casefold() == "tkkg" for name in _artist_names(first)):
        raise ValueError("Spotify first-track result is not credited to TKKG.")
    expected_first_title = _normalise(f"{number} {title} Teil 01")
    if _normalise(str(first.get("name", ""))) != expected_first_title:
        raise ValueError(
            f"Spotify first-track title mismatch: expected '{number} - {title} - Teil 01', "
            f"received {first.get('name')!r}."
        )
    album_id = first.get("album_id")
    if not isinstance(album_id, str) or not re.fullmatch(r"[A-Za-z0-9]{22}", album_id):
        raise ValueError("Spotify first-track result has no valid album ID.")
    album_name = first.get("album_name")
    if not isinstance(album_name, str) or not album_name.strip():
        raise ValueError("Spotify first-track result has no album name.")

    album_url = f"{SPOTIFY_ALBUM_BASE}{album_id}"
    album_file = work_dir / "spotify-album.spotdl"
    records = _save_spotify_metadata(album_url, album_file)
    if any(item.get("album_id") != album_id for item in records):
        raise ValueError("Spotify album response contains records from another album.")
    numbers = []
    for item in records:
        try:
            track_number = int(item.get("track_number"))
        except (TypeError, ValueError) as exc:
            raise ValueError("Spotify album contains a track without a valid track number.") from exc
        if track_number < 1:
            raise ValueError("Spotify album contains a non-positive track number.")
        numbers.append(track_number)
    if len(set(numbers)) != len(numbers) or sorted(numbers) != list(range(1, len(records) + 1)):
        disc_numbers = [item.get("disc_number") for item in records]
        raise ValueError("Spotify album track sequence is incomplete. Track numbers: " + str(numbers) + "; disc numbers: " + str(disc_numbers))
    records.sort(key=lambda item: int(item["track_number"]))
    if not all(isinstance(item.get("name"), str) and item["name"].strip() for item in records):
        raise ValueError("Spotify album contains a track without a title.")
    return {
        "album_id": album_id,
        "url": album_url,
        "title": album_name,
        "track_count": len(records),
        "tracks": records,
        "source_query": first_track_query,
    }


def _candidate_playlist_id(candidate: dict[str, Any]) -> str | None:
    playlist_id = candidate.get("playlistId")
    if isinstance(playlist_id, str) and playlist_id.startswith(("OLAK5uy_", "PL")):
        return playlist_id
    browse_id = candidate.get("browseId")
    if isinstance(browse_id, str) and browse_id.startswith("VLPL"):
        return browse_id[2:]
    return None


def _candidate_artists(candidate: dict[str, Any], playlist: dict[str, Any]) -> list[str]:
    values: list[str] = []
    for source in (candidate, playlist):
        for key in ("artist", "author"):
            value = source.get(key)
            if isinstance(value, str):
                values.append(value)
        for key in ("artists", "artist"):
            value = source.get(key)
            if isinstance(value, list):
                values.extend(
                    str(item.get("name", "")) if isinstance(item, dict) else str(item)
                    for item in value
                )
    for track in playlist.get("tracks", []):
        if not isinstance(track, dict):
            continue
        artists = track.get("artists")
        if isinstance(artists, list):
            values.extend(
                str(item.get("name", "")) if isinstance(item, dict) else str(item)
                for item in artists
            )
    return [value for value in values if value.strip()]


def _track_titles_match(spotify_tracks: list[dict[str, Any]], ytm_tracks: list[dict[str, Any]]) -> bool:
    if not spotify_tracks or len(spotify_tracks) != len(ytm_tracks):
        return False
    for spotify_track, ytm_track in zip(spotify_tracks, ytm_tracks, strict=True):
        spotify_title = spotify_track.get("name")
        ytm_title = ytm_track.get("title")
        if not isinstance(spotify_title, str) or not isinstance(ytm_title, str):
            return False
        if _normalise(spotify_title) != _normalise(ytm_title):
            return False
    return True


def find_verified_youtube_music_playlist(
    episode: dict[str, Any], spotify: dict[str, Any], ytm: Any,
) -> dict[str, Any]:
    number = int(episode["number"])
    title = str(episode["title"])
    queries = (
        f"TKKG {number:03d} {title}",
        f"TKKG Folge {number} {title}",
    )
    candidates: dict[str, dict[str, Any]] = {}
    for query in queries:
        for filter_name in ("albums", "playlists"):
            try:
                time.sleep(0.35)
                results = ytm.search(query, filter=filter_name, limit=10)
            except Exception as exc:
                raise RuntimeError(f"YouTube Music search failed for {query!r}: {exc}") from exc
            for result in results:
                if not isinstance(result, dict):
                    continue
                playlist_id = _candidate_playlist_id(result)
                if playlist_id:
                    candidates.setdefault(playlist_id, result)

    verified: dict[str, dict[str, Any]] = {}
    rejected: list[str] = []
    for playlist_id, candidate in candidates.items():
        try:
            time.sleep(0.35)
            playlist = ytm.get_playlist(playlist_id, limit=None)
        except Exception as exc:
            rejected.append(f"{playlist_id}: playlist retrieval failed: {exc}")
            continue
        if not isinstance(playlist, dict):
            rejected.append(f"{playlist_id}: malformed playlist response")
            continue
        playlist_title = str(playlist.get("title") or candidate.get("title") or "")
        if _normalise(title) not in _normalise(playlist_title):
            rejected.append(f"{playlist_id}: title does not identify episode {number}")
            continue
        tracks = playlist.get("tracks")
        if not isinstance(tracks, list) or not tracks:
            rejected.append(f"{playlist_id}: no track list returned")
            continue
        artist_names = _candidate_artists(candidate, playlist)
        if not any(re.search(r"\btkkg\b", unicodedata.normalize("NFKC", name).casefold()) for name in artist_names):
            rejected.append(f"{playlist_id}: no TKKG artist evidence")
            continue
        if not _track_titles_match(spotify["tracks"], tracks):
            rejected.append(
                f"{playlist_id}: track list does not exactly match the {spotify['track_count']} Spotify tracks in order"
            )
            continue
        verified[playlist_id] = {
            "playlist_id": playlist_id,
            "url": f"{YTM_BASE}{urlencode({'list': playlist_id})}",
            "title": playlist_title,
            "track_count": len(tracks),
        }

    if len(verified) == 0:
        detail = "; ".join(rejected[:5]) or "no matching album or playlist candidates found"
        raise ValueError(f"No verified YouTube Music playlist for episode {number}: {detail}")
    if len(verified) > 1:
        ids = ", ".join(sorted(verified))
        raise ValueError(f"Ambiguous YouTube Music match for episode {number}; verified candidates: {ids}")
    return next(iter(verified.values()))


def discover_episode_audio(episode: dict[str, Any], ytm: Any) -> dict[str, Any]:
    from datetime import datetime, timezone

    with tempfile.TemporaryDirectory(prefix=f"tkkg_audio_{episode['number']:03d}_") as temp:
        spotify = resolve_spotify_album(episode, Path(temp))
    youtube_music = find_verified_youtube_music_playlist(episode, spotify, ytm)
    verified_at = datetime.now(timezone.utc).isoformat()
    return {
        "spotify": {
            "album_id": spotify["album_id"],
            "url": spotify["url"],
            "title": spotify["title"],
            "track_count": spotify["track_count"],
            "source_query": spotify["source_query"],
        },
        "youtube_music": youtube_music,
        "verification": {
            "status": "verified",
            "verified_at": verified_at,
            "method": "episode_identity_and_exact_ordered_track_titles",
            "matched_track_count": spotify["track_count"],
        },
    }


def audio_release_coverage(episodes: list[dict[str, Any]]) -> dict[str, Any]:
    verified = [
        item for item in episodes
        if isinstance(item.get("audio_release"), dict)
        and item["audio_release"].get("verification", {}).get("status") == "verified"
    ]
    return {
        "episode_count": len(episodes),
        "verified_pairings": len(verified),
        "missing_pairings": [
            {"number": item.get("number"), "title": item.get("title")}
            for item in episodes if item not in verified
        ],
    }


def preserve_verified_audio_releases(
    episodes: list[dict[str, Any]], previous: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    previous_by_number = {
        item.get("number"): item.get("audio_release")
        for item in previous
        if isinstance(item.get("audio_release"), dict)
        and item["audio_release"].get("verification", {}).get("status") == "verified"
    }
    conflicts: list[dict[str, Any]] = []
    for episode in episodes:
        old = previous_by_number.get(episode.get("number"))
        if old is None:
            continue
        current = episode.get("audio_release")
        if current is None:
            episode["audio_release"] = deepcopy(old)
        elif current != old:
            episode["audio_release"] = deepcopy(old)
            conflicts.append({
                "number": episode.get("number"),
                "reason": "new audio metadata differed from the previously verified mapping; previous mapping retained",
            })
    return conflicts


def _load_ytmusic() -> Any:
    try:
        from ytmusicapi import YTMusic
    except ImportError as exc:
        raise RuntimeError(
            "ytmusicapi is not installed. Install requirements-audio.txt first."
        ) from exc
    return YTMusic()


def enrich_catalogue(
    episodes: list[dict[str, Any]], *, selected_numbers: set[int] | None = None,
    limit: int = 5, write: bool = False, ytm: Any = None,
    catalogue_path: Path = CATALOGUE_PATH, latest_first: bool = False,
) -> dict[str, Any]:
    if limit < 1:
        raise ValueError("limit must be at least 1.")
    targets = [
        item for item in episodes
        if (selected_numbers is None or item.get("number") in selected_numbers)
        and not (
            isinstance(item.get("audio_release"), dict)
            and item["audio_release"].get("verification", {}).get("status") == "verified"
        )
    ]
    if latest_first:
        targets.sort(key=lambda item: int(item.get("number", 0)), reverse=True)
    targets = targets[:limit]
    report: dict[str, Any] = {
        "started_at": datetime.now(timezone.utc).isoformat(),
        "mode": "write" if write else "dry_run",
        "target_count": len(targets),
        "verified": [],
        "failures": [],
        "coverage_before": audio_release_coverage(episodes),
        "catalogue_updated": False,
    }
    if targets and ytm is None:
        ytm = _load_ytmusic()
    for episode in targets:
        number = episode.get("number")
        print(f"Discovering audio sources for episode {number}: {episode.get('title')}", flush=True)
        try:
            audio_release = discover_episode_audio(episode, ytm)
        except Exception as exc:
            report["failures"].append({
                "number": number,
                "title": episode.get("title"),
                "error": str(exc),
            })
            print(f"  unresolved: {exc}", flush=True)
            continue
        report["verified"].append({
            "number": number,
            "title": episode.get("title"),
            "audio_release": audio_release,
        })
        print(
            f"  verified: Spotify {audio_release['spotify']['track_count']} tracks, "
            f"YouTube Music {audio_release['youtube_music']['playlist_id']}",
            flush=True,
        )
        if write:
            episode["audio_release"] = audio_release
    report["coverage_after"] = audio_release_coverage(episodes)
    report["finished_at"] = datetime.now(timezone.utc).isoformat()
    if write and report["verified"]:
        if catalogue_path.resolve() == CATALOGUE_PATH.resolve():
            write_catalogue(episodes, DATA_DIR)
        else:
            catalogue_path.write_text(
                json.dumps(episodes, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
        report["catalogue_updated"] = True
        if catalogue_path.resolve() == CATALOGUE_PATH.resolve():
            scrape_report = {}
            try:
                if REPORT_PATH.exists():
                    loaded_report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
                    if isinstance(loaded_report, dict):
                        scrape_report = loaded_report
            except (OSError, json.JSONDecodeError):
                scrape_report = {}
            scrape_report["audio_release_coverage"] = report["coverage_after"]
            scrape_report["audio_enrichment"] = {
                "updated_at": report["finished_at"],
                "verified_count": len(report["verified"]),
                "failure_count": len(report["failures"]),
            }
            REPORT_PATH.write_text(
                json.dumps(scrape_report, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
    return report


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Discover and verify Spotify/YouTube Music sources for TKKG episodes."
    )
    parser.add_argument("--episode", type=int, action="append", help="Episode number to process; may be repeated.")
    parser.add_argument("--limit", type=int, default=5, help="Maximum number of missing episodes to process (default: 5).")
    parser.add_argument("--write", action="store_true", help="Save only successfully verified pairings to episodes.json. Default is dry-run.")
    parser.add_argument("--latest-first", action="store_true", help="Process the highest-numbered missing episodes first.")
    parser.add_argument("--catalogue", type=Path, default=CATALOGUE_PATH, help="Path to the episode JSON catalogue.")
    parser.add_argument("--report", type=Path, default=REPORT_PATH, help="Path for the JSON run report.")
    args = parser.parse_args()

    try:
        episodes = json.loads(args.catalogue.read_text(encoding="utf-8"))
        if not isinstance(episodes, list):
            raise ValueError("Episode catalogue must be a JSON array.")
        if args.episode and any(number < 1 for number in args.episode):
            raise ValueError("Episode numbers must be positive.")
        report = enrich_catalogue(
            episodes,
            selected_numbers=set(args.episode) if args.episode else None,
            limit=args.limit,
            write=args.write,
            catalogue_path=args.catalogue,
            latest_first=args.latest_first,
        )
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(
            f"Audio discovery complete: {len(report['verified'])} verified, "
            f"{len(report['failures'])} unresolved.",
            flush=True,
        )
        return 0
    except Exception as exc:
        print(f"Audio discovery failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
