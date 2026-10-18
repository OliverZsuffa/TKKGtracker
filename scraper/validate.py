from __future__ import annotations

import json
import re
from pathlib import Path

from jsonschema import Draft202012Validator, FormatChecker


ROOT = Path(__file__).resolve().parents[1]


def validate_catalogue(episodes: list[dict], schema_path: Path | None = None) -> list[str]:
    schema_file = schema_path or ROOT / "schemas" / "episode.schema.json"
    schema = json.loads(schema_file.read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    errors: list[str] = []
    seen: dict[int, str] = {}
    for index, episode in enumerate(episodes):
        for error in validator.iter_errors(episode):
            errors.append(f"episode index {index}: {error.message}")
        for release_index, release in enumerate(episode.get("physical_releases", [])):
            for field in ("medium", "label", "ean", "release_date"):
                value = release.get(field)
                if not isinstance(value, str) or not value.strip():
                    continue
                if value.strip().casefold() in {"medium:", "label:", "ean:", "erscheinungstermin:"}:
                    errors.append(
                        f"episode {episode.get('number')} physical release {release_index}: "
                        f"{field} contains a field label instead of a value"
                    )
            ean = release.get("ean")
            if isinstance(ean, str) and ean.strip() and not re.search(r"\\d{8,14}", ean):
                errors.append(
                    f"episode {episode.get('number')} physical release {release_index}: "
                    "EAN contains no plausible 8–14 digit identifier"
                )

        number = episode.get("number")
        title = episode.get("title")
        if isinstance(number, int):
            if number in seen:
                errors.append(f"duplicate episode number {number}: {seen[number]!r} and {title!r}")
            else:
                seen[number] = str(title)
    return errors


def find_number_gaps(episodes: list[dict]) -> list[int]:
    numbers = sorted({episode["number"] for episode in episodes if isinstance(episode.get("number"), int)})
    if not numbers:
        return []
    return sorted(set(range(1, numbers[-1] + 1)) - set(numbers))
