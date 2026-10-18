# Request: Fix archive covers and source detail quality

## Status
Awaiting approval of implementation plan. No implementation changes are authorized yet.

## Desired outcome
Correct historical cover images from TKKG-Site, prevent Tumblr and social-page boilerplate from becoming episode metadata for episodes 207–217, and make official catalogue source links open the corresponding product details when the website genuinely supports a stable direct link.

## Context

### 1. Historical archive covers
The current cover extraction derives the image URL from an image element on the episode detail page. The resulting URLs are not reliable for the archive's actual cover files. Verified examples are:

- Episode 001: https://www.tkkg-site.de/uploads/pics/001_01.jpg
- Episode 002: https://www.tkkg-site.de/uploads/pics/002.jpg

The naming pattern is not consistent even in these first two examples. Do not assume a single filename template works for every episode.

### 2. Episodes 207–217 contain unrelated Tumblr content
Some episode records show a title such as “TKKG zum Hören — Drohbriefe von Unbekannt”, a cover pointing to a Tumblr avatar (64.media.tumblr.com/avatar_...), and synopsis text explaining Tumblr privacy policies. Track lists also include social controls such as “Open in app”, “Facebook”, “Tweet”, “Pinterest”, “Reddit”, “Mail”, “Embed”, and “Permalink”.

That material is page or embed boilerplate, not valid episode metadata. These records need a reliable source and correct episode title, description, and cover, without bypassing access restrictions on audio.tkkg-site.de. The previous request records that its robots.txt returns HTTP 403 and the scraper must fail closed. The official catalogue currently provides metadata for this range; investigate why invalid Tumblr content is still entering the displayed records and correct the source selection or parsing accordingly.

### 3. Official catalogue detail links
For products from https://www.tkkg.de/produkte/hoerspiele, the title and detail content load into a details pane when the user clicks the product arrow. The current source link opens the general catalogue instead of the relevant product details.

Investigate whether the site supports a stable public URL, hash, query parameter, or other ordinary navigation mechanism that opens the specific product detail pane. Implement a direct link only if it is supported and can be verified. If the detail pane is only an in-page interaction with no stable direct URL, retain the catalogue link rather than inventing a URL or promising unsupported behaviour.

## Scope

### Included
- Inspect current cover URL extraction, merge precedence, source provenance, and image rendering.
- Determine a robust cover selection strategy using actual source markup and verified image URLs. Check candidate image existence safely, avoid repeated requests, and use a deterministic fallback when no valid cover is found.
- Ensure Tumblr profile images, embed previews, privacy notices, and social controls are never accepted as episode covers, synopsis, or tracks.
- Trace records 207–217 to find why Tumblr-derived metadata appears despite the known robots restriction and official catalogue fallback.
- Inspect the official product detail interaction and test whether an ordinary direct link to an individual details pane is supported.
- Add regression tests and update request-specific testing and outcome notes.

### Excluded
- Do not bypass robots.txt, HTTP 403 responses, authentication, anti-bot controls, or other access restrictions.
- Do not guess image filenames or official product URLs without verification.
- Do not fabricate titles, descriptions, cast, tracks, or cover images.
- Do not make broad UI redesigns or change listening-progress behaviour.
- Do not weaken catalogue completeness validation or publish partial data.
- Do not implement until Oliver explicitly approves the plan.

## Acceptance criteria
- [ ] Episodes 001 and 002 use the verified correct cover images.
- [ ] Cover discovery supports inconsistent archive filenames without relying on a single assumed naming convention.
- [ ] Invalid image candidates, including Tumblr avatar/profile images, are rejected. Failed image checks are cached or otherwise bounded to avoid excessive network requests.
- [ ] Episodes 207–217 have the correct regular-series titles and do not contain Tumblr privacy notices, social links, or embed UI in synopsis/tracks/covers.
- [ ] The reason invalid Tumblr data entered those records is documented and fixed at the correct layer.
- [ ] The audio subdomain robots restriction remains respected.
- [ ] Official catalogue links open the relevant details pane only if a stable, verifiable direct URL is supported. Otherwise the existing catalogue link is retained.
- [ ] Regression tests cover known bad metadata, cover selection, failed image candidates, and direct-link behaviour.
- [ ] Full automated checks pass, and a live diagnostic confirms representative corrected records.
- [ ] No generated catalogue is published unless all existing validation and completeness checks pass.

## Evidence
- Episode 001 cover: https://www.tkkg-site.de/uploads/pics/001_01.jpg
- Episode 002 cover: https://www.tkkg-site.de/uploads/pics/002.jpg
- Historical series index: https://www.tkkg-site.de/de/hoeren/hoerspiele/serie.html
- Official catalogue: https://www.tkkg.de/produkte/hoerspiele
- Example Tumblr post: https://audio.tkkg-site.de/post/181374770249/folge-209
- Previous Request 002 diagnostics: https://github.com/OliverZsuffa/TKKGtracker/actions/runs/39114134477
