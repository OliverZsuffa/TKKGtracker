from __future__ import annotations

import re
from urllib.parse import urljoin

from bs4 import BeautifulSoup, Tag

from scraper.http import SourceClient


INDEX_URL = "https://www.tkkg-site.de/de/hoeren/hoerspiele/serie.html"
EPISODE_LINK = re.compile(r"Folge\s*0*(\d{1,3})\s*:?\s*(.+)", re.IGNORECASE)


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def discover_archive_episodes(client: SourceClient) -> list[dict]:
    soup = client.get_html(INDEX_URL)
    records: dict[int, dict] = {}
    for link in soup.find_all("a", href=True):
        label = _clean(link.get_text(" ", strip=True))
        match = EPISODE_LINK.match(label)
        if not match:
            continue
        number = int(match.group(1))
        title = _clean(match.group(2)).lstrip(":").strip()
        if not title or number < 1:
            continue
        url = urljoin(INDEX_URL, link["href"])
        if number not in records or (":" in label and "folge-" in url.lower()):
            records[number] = {
                "number": number,
                "title": title,
                "source_url": url,
                "source_name": "TKKG-Site archive",
            }
    return sorted(records.values(), key=lambda item: item["number"])


def _section_text(soup: BeautifulSoup, heading_text: str) -> str | None:
    target = next((h for h in soup.find_all(["h2", "h3", "h4", "h5"]) if _clean(h.get_text(" ", strip=True)).casefold() == heading_text.casefold()), None)
    if target is None:
        return None
    chunks: list[str] = []
    for sibling in target.next_siblings:
        if isinstance(sibling, Tag) and sibling.name in {"h2", "h3", "h4", "h5"}:
            break
        if isinstance(sibling, Tag):
            text = _clean(sibling.get_text(" ", strip=True))
            if text:
                chunks.append(text)
        elif str(sibling).strip():
            chunks.append(_clean(str(sibling)))
    result = _clean(" ".join(chunks))
    return result or None


def parse_archive_episode(client: SourceClient, discovered: dict) -> dict:
    soup = client.get_html(discovered["source_url"])
    heading = soup.find(["h1", "h2"])
    heading_text = _clean(heading.get_text(" ", strip=True)) if heading else discovered["title"]
    title_match = re.match(r"Folge\s*0*\d+\s*:\s*(.+)", heading_text, re.IGNORECASE)
    title = _clean(title_match.group(1)) if title_match else discovered["title"]

    record = {
        "number": discovered["number"],
        "title": title,
        "synopsis": _section_text(soup, "Klappentext"),
        "cover_url": None,
        "release_date": None,
        "release_year": None,
        "physical_releases": [],
        "tracks": [],
        "cast": [],
        "credits": [],
        "ratings": [],
        "sources": [{"name": discovered["source_name"], "url": discovered["source_url"]}],
    }

    image = soup.find("img", alt=re.compile(r"Folge\s*0*" + str(discovered["number"]), re.IGNORECASE))
    if image:
        record["cover_url"] = urljoin(discovered["source_url"], image.get("src") or image.get("data-src") or "")

    body_text = soup.get_text("\n", strip=True)
    medium = re.search(r"Medium:\s*\n([^\n]+)", body_text, re.IGNORECASE)
    label = re.search(r"Label:\s*\n([^\n]+)", body_text, re.IGNORECASE)
    release = re.search(r"Erscheinungstermin:\s*\n([^\n]+)", body_text, re.IGNORECASE)
    ean = re.search(r"EAN:\s*\n([^\n]+)", body_text, re.IGNORECASE)
    physical = {}
    if medium:
        physical["medium"] = _clean(medium.group(1))
    if label:
        physical["label"] = _clean(label.group(1))
    if ean:
        physical["ean"] = _clean(ean.group(1))
    if release:
        release_text = _clean(release.group(1))
        physical["release_date"] = release_text
        year_match = re.search(r"\b(19|20)\d{2}\b", release_text)
        if year_match:
            record["release_year"] = int(year_match.group(0))
    if physical:
        physical["source_url"] = discovered["source_url"]
        record["physical_releases"].append(physical)

    tracks_heading = next((h for h in soup.find_all(["h2", "h3", "h4", "h5"]) if "trackpunkte" in _clean(h.get_text(" ", strip=True)).casefold() or "cd-tracks" in _clean(h.get_text(" ", strip=True)).casefold()), None)
    if tracks_heading:
        for item in tracks_heading.find_all_next(["li"]):
            if item.find(["h2", "h3", "h4", "h5"]):
                break
            title_text = _clean(item.get_text(" ", strip=True))
            if title_text:
                record["tracks"].append({"title": re.sub(r"^\d+\.\s*", "", title_text)})

    speaker_heading = next((h for h in soup.find_all(["h2", "h3", "h4", "h5"]) if _clean(h.get_text(" ", strip=True)).casefold() == "sprecher"), None)
    if speaker_heading:
        for name_link in speaker_heading.find_all_next("a"):
            parent_text = _clean(name_link.parent.get_text(" ", strip=True))
            name = _clean(name_link.get_text(" ", strip=True))
            if name and parent_text and name in parent_text:
                character = _clean(parent_text.replace(name, "").strip(" :"))
                record["cast"].append({"name": name, "character": character or None})
            if len(record["cast"]) >= 100:
                break

    production_text = _section_text(soup, "Produktion")
    if production_text:
        for line in re.split(r"\s{2,}|(?<=[.!])\s+(?=[A-ZÄÖÜ])", production_text):
            line = _clean(line)
            match = re.match(r"([^:]{2,60}):\s*(.+)", line)
            if match:
                record["credits"].append({"role": _clean(match.group(1)), "name": _clean(match.group(2))})

    ratings_match = re.search(r"Durchschnitts-\s*bewertungen:(.*?)(?:Rang\s*#?(\d+))?", body_text, re.IGNORECASE | re.DOTALL)
    if ratings_match:
        rating_text = _clean(ratings_match.group(1))
        for category, value in re.findall(r"(Team|Mitglieder|Leser|Gesamt)\s*(\d+)%", rating_text, re.IGNORECASE):
            record["ratings"].append({"source": "TKKG-Site archive", "category": category, "value": value + "%", "review_count": None})

    return record
