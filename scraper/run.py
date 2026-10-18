from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from scraper.export import write_catalogue
from scraper.http import SourceAccessError, SourceClient
from scraper.merge import merge_records
from scraper.sources.archive import discover_archive_episodes, parse_archive_episode
from scraper.sources.official import discover_official_episodes
from scraper.sources.tumblr import parse_tumblr_episode
from scraper.validate import find_number_gaps, validate_catalogue


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
REPORT_PATH = DATA_DIR / "scrape-report.json"


def main() -> int:
    now = datetime.now(timezone.utc).isoformat()
    client = SourceClient()
    report = {
        "started_at": now,
        "sources": {},
        "warnings": [],
        "conflicts": [],
        "gaps": [],
        "episode_count": 0,
        "validation_errors": [],
        "success": False,
    }
    try:
        archive_entries = discover_archive_episodes(client)
        report["sources"]["archive_index_entries"] = len(archive_entries)
        archive_records = []
        for entry in archive_entries:
            try:
                if entry["number"] <= 206 and "serie/folge-" in entry["source_url"]:
                    archive_records.append(parse_archive_episode(client, entry))
                elif entry["number"] >= 207 and "audio.tkkg-site.de" in entry["source_url"]:
                    archive_records.append(parse_tumblr_episode(client, entry))
            except SourceAccessError as exc:
                report["warnings"].append(str(exc))

        official_records = discover_official_episodes(client)
        report["sources"]["official_records"] = len(official_records)
        report["sources"]["archive_detail_records"] = len(archive_records)

        # Archive records are the preferred title source for the episodes it explicitly indexes.
        archive_records.sort(key=lambda item: item["number"])
        official_records.sort(key=lambda item: item["number"])
        combined = archive_records + official_records
        episodes, conflicts = merge_records(combined)
        report["conflicts"] = conflicts
        report["gaps"] = find_number_gaps(episodes)
        report["episode_count"] = len(episodes)

        # A source outage or empty result must never overwrite a previously valid catalogue.
        if len(episodes) < 200:
            raise RuntimeError(f"Only {len(episodes)} episodes discovered; refusing to publish a suspiciously small catalogue.")

        # Provenance timestamps are part of the schema, so add them before validation.
        for episode in episodes:
            episode["last_checked"] = now
            for source in episode["sources"]:
                source.setdefault("retrieved_at", now)

        errors = validate_catalogue(episodes)
        report["validation_errors"] = errors
        if errors:
            raise RuntimeError(f"Catalogue schema validation failed with {len(errors)} error(s).")
        if report["gaps"]:
            report["warnings"].append(f"Numbering gaps detected: {report['gaps']}")
        if conflicts:
            report["warnings"].append(f"Conflicting titles detected for {len(conflicts)} episode number(s); first source value retained.")

        write_catalogue(episodes, DATA_DIR)
        report["success"] = True
        report["finished_at"] = datetime.now(timezone.utc).isoformat()
        REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Published {len(episodes)} episode records. Gaps: {len(report['gaps'])}. Conflicts: {len(conflicts)}.")
        return 0
    except Exception as exc:
        report["fatal_error"] = str(exc)
        report["finished_at"] = datetime.now(timezone.utc).isoformat()
        REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
        REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Catalogue refresh failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
