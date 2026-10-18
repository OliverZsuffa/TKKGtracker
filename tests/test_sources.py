from __future__ import annotations

import unittest

from bs4 import BeautifulSoup

from scraper.sources.archive import discover_archive_episodes, parse_archive_episode, _resolve_index_link
from scraper.sources.official import parse_official_page
from scraper.sources.tumblr import parse_tumblr_episode


class FakeClient:
    def __init__(self, pages: dict[str, str]):
        self.pages = pages

    def get_html(self, url: str):
        if url not in self.pages:
            raise AssertionError(f"Unexpected URL requested by parser test: {url}")
        return BeautifulSoup(self.pages[url], "html.parser")


class SourceParserTests(unittest.TestCase):
    def test_archive_index_discovers_episode_link(self):
        client = FakeClient({
            "https://www.tkkg-site.de/de/hoeren/hoerspiele/serie.html": '''
              <a href="/de/hoeren/hoerspiele/serie/folge-001/inhalt.html">Folge 001: Die Jagd nach den Millionendieben</a>
            '''
        })
        records = discover_archive_episodes(client)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]["number"], 1)
        self.assertEqual(records[0]["title"], "Die Jagd nach den Millionendieben")
        self.assertEqual(records[0]["source_url"], "https://www.tkkg-site.de/de/hoeren/hoerspiele/serie/folge-001/inhalt.html")

    def test_archive_resolves_real_world_href_forms_without_duplicate_path(self):
        expected = "https://www.tkkg-site.de/de/hoeren/hoerspiele/serie/folge-001/inhalt.html"
        hrefs = [
            "/de/hoeren/hoerspiele/serie/folge-001/inhalt.html",
            "de/hoeren/hoerspiele/serie/folge-001/inhalt.html",
            "serie/folge-001/inhalt.html",
            expected,
            "https://www.tkkg-site.de/de/hoeren/hoerspiele/de/hoeren/hoerspiele/serie/folge-001/inhalt.html",
        ]
        for href in hrefs:
            with self.subTest(href=href):
                self.assertEqual(_resolve_index_link(href), expected)

    def test_archive_keeps_audio_subdomain_links_unchanged(self):
        href = "https://audio.tkkg-site.de/post/175481640949/folge207"
        self.assertEqual(_resolve_index_link(href), href)

    def test_archive_detail_extracts_synopsis_tracks_and_release(self):
        url = "https://www.tkkg-site.de/de/hoeren/hoerspiele/serie/folge-001/inhalt.html"
        client = FakeClient({
            url: '''
              <h1>Folge 001: Die Jagd nach den Millionendieben</h1>
              <img alt="Folge 001: Die Jagd nach den Millionendieben" src="/cover.jpg">
              <p>Medium:</p><p>LP / MC / CD</p>
              <p>Label:</p><p>EUROPA</p>
              <p>Erscheinungstermin:</p><p>1981 (LP / MC) / 12. Mai 2003 (CD)</p>
              <p>EAN:</p><p>743219895943 (MC)</p>
              <h3>Klappentext</h3><p>Ein spannender Fall.</p>
              <h3>Trackpunkte</h3><ol><li>Erster Track</li><li>Zweiter Track</li></ol>
              <h3>Sprecher</h3><dl><dt>Tim</dt><dd><a>Sascha Draeger</a></dd></dl>
              <h3>Produktion</h3><p>Produktion und Regie: Heikedine Körting</p>
            '''
        })
        discovered = {"number": 1, "title": "Die Jagd nach den Millionendieben", "source_url": url, "source_name": "TKKG-Site archive"}
        record = parse_archive_episode(client, discovered)
        self.assertEqual(record["synopsis"], "Ein spannender Fall.")
        self.assertEqual(record["release_year"], 1981)
        self.assertEqual(len(record["tracks"]), 2)
        self.assertEqual(record["physical_releases"][0]["label"], "EUROPA")

    def test_official_page_extracts_episode_title_and_synopsis(self):
        url = "https://www.tkkg.de/produkte/hoerspiele"
        client = FakeClient({
            url: '''
              <article>
                <img src="/cover.jpg" alt="TKKG Hörspiel-Folge 243: Die Fährte des Hehlers">
                <h3>Die Fährte des Hehlers</h3>
                <h4>TKKG Hörspiel-Folge 243</h4>
                <h5>Inhalt</h5><p>Ein Fall mit einem Hehler.</p>
                <h5>Sprecher</h5><p>Tim - Sascha Draeger</p><p>Karl - Tobias Diakow</p>
                <h5>Details</h5><p>Produktion und Regie: Heikedine Körting</p><p>Redaktion: Petra Delmar</p>
              </article>
            '''
        })
        records = parse_official_page(client, 0)
        self.assertEqual(len(records), 1)
        self.assertEqual(records[0]["number"], 243)
        self.assertEqual(records[0]["title"], "Die Fährte des Hehlers")
        self.assertEqual(records[0]["synopsis"], "Ein Fall mit einem Hehler.")
        self.assertEqual(len(records[0]["cast"]), 2)
        self.assertEqual(len(records[0]["credits"]), 2)
        self.assertTrue(records[0]["cover_url"].endswith("/cover.jpg"))

    def test_official_page_rejects_number_heading_outside_product_card(self):
        url = "https://www.tkkg.de/produkte/hoerspiele"
        client = FakeClient({
            url: '''
              <article>
                <img src="/cover.jpg" alt="TKKG Hörspiel-Folge 243: Die Fährte des Hehlers">
                <h3>Die Fährte des Hehlers</h3>
                <h4>TKKG Hörspiel-Folge 243</h4>
                <h5>Inhalt</h5><p>Ein Fall mit einem Hehler.</p>
              </article>
              <h4>TKKG Hörspiel-Folge 500</h4>
            '''
        })
        diagnostics = []
        records = parse_official_page(client, 0, diagnostics)
        self.assertEqual([record["number"] for record in records], [243])
        self.assertEqual(len(diagnostics), 1)
        self.assertEqual(diagnostics[0]["number"], 500)
        self.assertIn("not inside a product card", diagnostics[0]["reason"])

    def test_official_page_rejects_mismatched_cover_number(self):
        url = "https://www.tkkg.de/produkte/hoerspiele"
        client = FakeClient({
            url: '''
              <article>
                <img src="/cover.jpg" alt="TKKG Hörspiel-Folge 243: Die Fährte des Hehlers">
                <h3>Die Fährte des Hehlers</h3>
                <h4>TKKG Hörspiel-Folge 500</h4>
              </article>
            '''
        })
        diagnostics = []
        records = parse_official_page(client, 0, diagnostics)
        self.assertEqual(records, [])
        self.assertEqual(diagnostics[0]["number"], 500)
        self.assertIn("conflicts with cover image number 243", diagnostics[0]["reason"])

    def test_tumblr_post_extracts_release_and_tracks(self):
        url = "https://audio.tkkg-site.de/post/test/folge207"
        client = FakeClient({
            url: '''
              <h2>Doppelte Entführung (Folge 207)</h2>
              <p>Ein Internetstar wurde entführt.</p>
              <p>EAN: 190758362724</p>
              <p>Veröffentlichungsdatum: 14. September 2018</p>
              <h2>Sprecher</h2><ul><li>Tim - Sascha Draeger</li></ul>
              <h2>CD-Tracks</h2><ol><li>Entführung auf Band</li></ol>
            '''
        })
        discovered = {"number": 207, "title": "Doppelte Entführung", "source_url": url, "source_name": "TKKG-Site archive"}
        record = parse_tumblr_episode(client, discovered)
        self.assertEqual(record["title"], "Doppelte Entführung")
        self.assertEqual(record["release_year"], 2018)
        self.assertEqual(record["physical_releases"][0]["ean"], "190758362724")
        self.assertEqual(record["tracks"][0]["title"], "Entführung auf Band")


if __name__ == "__main__":
    unittest.main()
