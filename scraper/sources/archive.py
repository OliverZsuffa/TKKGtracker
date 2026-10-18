from __future__ import annotations

import re
from urllib.parse import urljoin, urlsplit, urlunsplit

from bs4 import BeautifulSoup, Tag

from scraper.http import SourceClient


INDEX_URL = "https://www.tkkg-site.de/de/hoeren/hoerspiele/serie.html"
ARCHIVE_PREFIX = "/de/hoeren/hoerspiele/"
ARCHIVE_ORIGIN = "https://www.tkkg-site.de"
EPISODE_LINK = re.compile(r"Folge\s*0*(\d{1,3})\s*:?\s*(.+)", re.IGNORECASE)
HEADING_TAGS = {"h2", "h3", "h4", "h5"}


def _clean(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _resolve_index_link(href: str) -> str:
    """Resolve the archive's mixed absolute, root-relative, and directory-relative hrefs."""
    resolved = urljoin(INDEX_URL, href.strip())
    parsed = urlsplit(resolved)
    path = parsed.path

    # Some archive links omit the leading slash, so urljoin treats the site-root
    # path as relative to /de/hoeren/hoerspiele/ and duplicates that directory.
    doubled_prefix = ARCHIVE_PREFIX + ARCHIVE_PREFIX.lstrip("/")
    if path.startswith(doubled_prefix):
        path = ARCHIVE_PREFIX + path[len(doubled_prefix):]

    return urlunsplit((parsed.scheme, parsed.netloc, path, parsed.query, parsed.fragment))


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
        url = _resolve_index_link(link["href"])
        if number not in records or (":" in label and "folge-" in url.lower()):
            records[number] = {
                "number": number,
                "title": title,
                "source_url": url,
                "source_name": "TKKG-Site archive",
            }
    return sorted(records.values(), key=lambda item: item["number"])


def _section_lines(soup: BeautifulSoup, heading_text: str) -> list[str]:
    target = next((h for h in soup.find_all(list(HEADING_TAGS)) if _clean(h.get_text(" ", strip=True)).casefold() == heading_text.casefold()), None)
    if target is None:
        return []
    lines: list[str] = []
    for sibling in target.next_siblings:
        if isinstance(sibling, Tag) and sibling.name in HEADING_TAGS:
            break
        if isinstance(sibling, Tag):
            value = sibling.get_text("\n", strip=True)
            lines.extend(_clean(line) for line in value.splitlines() if _clean(line))
        elif str(sibling).strip():
            lines.append(_clean(str(sibling)))
    return lines


def _section_text(soup: BeautifulSoup, heading_text: str) -> str | None:
    result = _clean(" ".join(_section_lines(soup, heading_text)))
    return result or None


def _section_list_items(heading: Tag) -> list[str]:
    items: list[str] = []
    for node in heading.next_elements:
        if isinstance(node, Tag) and node.name in HEADING_TAGS:
            break
        if isinstance(node, Tag) and node.name == "li":
            value = _clean(node.get_text(" ", strip=True))
            if value:
                items.append(re.sub(r"^\d+\.\s*", "", value))
    return items



def _image_candidates(soup: BeautifulSoup, episode_number: int, page_url: str) -> list[str]:
    """Collect explicit episode-cover URLs from markup without guessing filenames."""
    candidates: list[tuple[int, str]] = []

    def add(raw: str | None, score: int) -> None:
        if not raw:
            return
        raw = raw.strip().split()[0]
        if not raw or raw.startswith("data:"):
            return
        # The archive often emits uploads/pics/... without a leading slash.
        # Treat that path as site-root relative, not relative to the episode page.
        if raw.lstrip("/").startswith("uploads/pics/"):
            absolute = urljoin(ARCHIVE_ORIGIN + "/", raw.lstrip("/"))
        else:
            absolute = urljoin(page_url, raw)
        parsed = urlsplit(absolute)
        if parsed.scheme not in {"http", "https"} or parsed.netloc not in {"www.tkkg-site.de", "tkkg-site.de"}:
            return
        path = parsed.path.casefold()
        filename = path.rsplit("/", 1)[-1]
        if not re.search(rf"(?<!\d)0*{episode_number}(?!\d)", filename) and not re.search(rf"folge\s*0*{episode_number}(?!\d)", raw, re.I):
            return
        if "/uploads/pics/" in path:
            score += 20
        if filename.startswith(str(episode_number).zfill(3)):
            score += 10
        if any(token in path for token in ("avatar", "logo", "icon", "placeholder")):
            return
        candidates.append((score, absolute))

    for image in soup.find_all("img"):
        alt = str(image.get("alt", ""))
        image_score = 10 if re.search(rf"folge\s*0*{episode_number}(?!\d)", alt, re.I) else 0
        for attr in ("src", "data-src", "data-lazy-src", "data-original", "data-image"):
            add(image.get(attr), image_score)
        srcset = image.get("srcset") or image.get("data-srcset")
        if srcset:
            for candidate in srcset.split(","):
                add(candidate.strip().split(" ")[0], image_score)
        parent_link = image.find_parent("a", href=True)
        if parent_link:
            add(parent_link.get("href"), image_score)

    for meta in soup.find_all("meta"):
        if meta.get("property") in {"og:image", "og:image:url"} or meta.get("name") == "twitter:image":
            add(meta.get("content"), 0)

    unique: dict[str, int] = {}
    for score, url in candidates:
        unique[url] = max(score, unique.get(url, -1))
    return [url for url, _ in sorted(unique.items(), key=lambda item: (-item[1], item[0]))]



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

    candidates = _image_candidates(soup, discovered["number"], discovered["source_url"])
    if candidates:
        record["cover_url"] = candidates[0]

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

    tracks_heading = next((h for h in soup.find_all(list(HEADING_TAGS)) if "trackpunkte" in _clean(h.get_text(" ", strip=True)).casefold() or "cd-tracks" in _clean(h.get_text(" ", strip=True)).casefold()), None)
    if tracks_heading:
        record["tracks"] = [{"title": title} for title in _section_list_items(tracks_heading)]

    speaker_heading = next((h for h in soup.find_all(list(HEADING_TAGS)) if _clean(h.get_text(" ", strip=True)).casefold() == "sprecher"), None)
    if speaker_heading:
        for node in speaker_heading.next_elements:
            if isinstance(node, Tag) and node.name in HEADING_TAGS:
                break
            if not isinstance(node, Tag) or node.name != "a":
                continue
            name = _clean(node.get_text(" ", strip=True))
            if not name:
                continue
            character = None
            dt = node.find_previous("dt")
            if dt and dt.find_previous("h1") is not None:
                character_text = _clean(dt.get_text(" ", strip=True)).rstrip(":")
                character = character_text or None
            record["cast"].append({"name": name, "character": character})

    for line in _section_lines(soup, "Produktion"):
        match = re.match(r"([^:]{2,60}):\s*(.+)", line)
        if match:
            record["credits"].append({"role": _clean(match.group(1)), "name": _clean(match.group(2))})

    ratings_match = re.search(r"Durchschnitts-\s*bewertungen:(.*?)(?:Rang\s*#?(\d+))?", body_text, re.IGNORECASE | re.DOTALL)
    if ratings_match:
        rating_text = _clean(ratings_match.group(1))
        for category, value in re.findall(r"(Team|Mitglieder|Leser|Gesamt)\s*(\d+)%", rating_text, re.IGNORECASE):
            record["ratings"].append({"source": "TKKG-Site archive", "category": category, "value": value + "%", "review_count": None})

    return record
