from __future__ import annotations

import re
from urllib.parse import urljoin

from bs4 import BeautifulSoup, Tag

from scraper.http import SourceClient


BASE_URL = "https://www.tkkg.de/produkte/hoerspiele"
EPISODE_HEADING = re.compile(r"TKKG\s+Hörspiel-Folge\s+(\d+)", re.IGNORECASE)


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _section(card: Tag, label: str) -> str | None:
    headings = card.find_all(["h5", "h6"])
    target = next((h for h in headings if _clean(h.get_text(" ", strip=True)).casefold() == label.casefold()), None)
    if target is None:
        return None
    parts: list[str] = []
    for sibling in target.next_siblings:
        if isinstance(sibling, Tag) and sibling.name in {"h5", "h6"}:
            break
        if isinstance(sibling, Tag):
            value = _clean(sibling.get_text(" ", strip=True))
            if value:
                parts.append(value)
        elif str(sibling).strip():
            parts.append(_clean(str(sibling)))
    result = _clean(" ".join(parts))
    return result or None


def _find_card(heading: Tag) -> Tag:
    for parent in heading.parents:
        if not isinstance(parent, Tag):
            continue
        if len(parent.find_all("h4")) == 1 and parent.find("img"):
            return parent
    return heading.parent if isinstance(heading.parent, Tag) else heading


def parse_official_page(client: SourceClient, page_number: int) -> list[dict]:
    url = BASE_URL if page_number == 0 else f"{BASE_URL}?page={page_number}"
    soup = client.get_html(url)
    records: list[dict] = []
    for episode_heading in soup.find_all(["h4", "h5", "h6"]):
        match = EPISODE_HEADING.search(_clean(episode_heading.get_text(" ", strip=True)))
        if not match:
            continue
        number = int(match.group(1))
        card = _find_card(episode_heading)
        title_heading = episode_heading.find_previous(["h2", "h3"])
        title = _clean(title_heading.get_text(" ", strip=True)) if title_heading else ""
        if not title:
            image = card.find("img")
            alt = _clean(image.get("alt", "")) if image else ""
            title_match = re.search(r"Folge\s+\d+\s*:\s*(.+)$", alt, re.IGNORECASE)
            title = _clean(title_match.group(1)) if title_match else ""
        if not title or any(term in title.casefold() for term in ("live-album", "live album", "hörspiel-box", "krimi-box")):
            continue

        image = card.find("img")
        image_url = None
        if image:
            image_url = urljoin(url, image.get("src") or image.get("data-src") or image.get("data-lazy-src") or "")
            if image_url.endswith("/"):
                image_url = None

        synopsis = _section(card, "Inhalt")
        cast_text = _section(card, "Sprecher")
        details_text = _section(card, "Details")
        cast = []
        if cast_text:
            for line in re.split(r"\s{2,}|(?<=[.!])\s+(?=[A-ZÄÖÜ][^ ]+\s+-)", cast_text):
                line = _clean(line)
                if " - " in line:
                    character, name = line.split(" - ", 1)
                    cast.append({"name": _clean(name), "character": _clean(character)})
        credits = []
        if details_text:
            for part in re.split(r"\s{2,}|(?<=\.)\s+(?=[A-ZÄÖÜ])", details_text):
                part = _clean(part)
                if ":" in part:
                    role, name = part.split(":", 1)
                    credits.append({"role": _clean(role), "name": _clean(name)})

        records.append({
            "number": number,
            "title": title,
            "synopsis": synopsis,
            "cover_url": image_url,
            "release_date": None,
            "release_year": None,
            "physical_releases": [],
            "tracks": [],
            "cast": cast,
            "credits": credits,
            "ratings": [],
            "sources": [{"name": "Official TKKG catalogue", "url": url}],
        })
    return records


def discover_official_episodes(client: SourceClient, max_pages: int = 30) -> list[dict]:
    records: dict[tuple[int, str], dict] = {}
    empty_pages = 0
    for page in range(max_pages):
        page_records = parse_official_page(client, page)
        if not page_records:
            empty_pages += 1
            if empty_pages >= 2:
                break
            continue
        empty_pages = 0
        for record in page_records:
            records[(record["number"], record["title"])] = record
    return list(records.values())
