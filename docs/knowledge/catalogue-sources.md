# Catalogue source findings

## Verified public pages

- Official catalogue: https://www.tkkg.de/produkte/hoerspiele
- Official catalogue pagination uses a page query parameter, for example https://www.tkkg.de/produkte/hoerspiele?page=3.
- The official page exposes numbered episode headings, synopses, cover image references, speaker lists, and production credits for many releases. Metadata coverage varies by episode.
- TKKG-Site historical index: https://www.tkkg-site.de/de/hoeren/hoerspiele/serie.html
- The historical index links episodes 1 to 206 to individual archive pages and links episodes 207 to 217 to posts on audio.tkkg-site.de.
- Example historical detail page: https://www.tkkg-site.de/de/hoeren/hoerspiele/serie/folge-001/inhalt.html. It exposes synopsis, release medium, label, release information, EANs, track points, cast, production credits, and ratings.
- Example newer episode page: https://audio.tkkg-site.de/post/175481640949/folge207. It exposes synopsis, EAN, publication date, cast, tracks, and production credits.

## Data quality cautions

- Do not assume all metadata fields are present for every episode.
- The official listing includes a live album using an existing episode number. Exclude obvious live album and box set products from the regular episode list.
- The official page text can contain repeated or conflicting episode numbers and titles. Preserve conflicts in the scrape report and do not silently treat every product card as a distinct regular episode.
- The historical archive is the preferred title source for episodes it explicitly indexes. The official catalogue is needed to discover later releases beyond the historical index.
- The source pages were inspected, but robots.txt and all applicable site terms have not yet been independently verified in the runtime environment. The scraper must check robots.txt before requesting source pages and fail closed when it cannot establish access permission.

## Extraction strategy

Use independent source adapters and saved HTML fixtures for tests. Store source URLs and retrieval timestamps with each record. Treat numbering gaps and conflicting titles as review warnings unless a documented rule establishes that a record is invalid.

## Verified live-fetch findings (18 October 2026)

- The historical archive index lists episodes 1–206 at https://www.tkkg-site.de/de/hoeren/hoerspiele/serie.html. Some index hrefs are directory-relative without a leading slash (de/hoeren/...). Resolve them against the origin root or normalize the duplicated /de/hoeren/hoerspiele/ prefix; do not change the audio.tkkg-site.de host for episodes 207–217.
- The official listing's episode detail data is already embedded in the initial HTML inside collapsed div elements with IDs such as detail57142. The adjacent teaser contains the title and cover, and its arrow link uses data-modal="#detail57142". Pair the detail panel with that sibling teaser. No browser automation or guessed XHR endpoint is needed for the fields inspected.
- The listing currently omits main-series episodes 222, 223, and 234 even though verified official detail pages exist: https://www.tkkg.de/produkte/details/roter-drache-222, https://www.tkkg.de/produkte/details/betruger-super-sauber, and https://www.tkkg.de/produkte/details/im-auftrag-des-bosen. These are explicit supplemental sources and should be fetched only when the listing has no record for the number. Keep the catalogue completeness guard enabled if a fallback fails.
- The official listing also includes "Jede Legende hat Ihren Anfang (Hörspiel zum Kinofilm)" labelled as episode 500. Its title identifies it as a film tie-in, not a regular main-series episode. Exclude it by the product title evidence, not by an arbitrary maximum episode number.
- During the 18 October live test, the archive adapter fetched all 217 index entries and parsed all 217 archive records without fetch warnings. The corrected official parser extracted listing data and correctly identified the special episode 500; the remaining test was to add the three verified detail-page fallbacks and rerun completeness validation.
