# Implementation plan: TKKG catalogue and listening tracker

**Status:** Awaiting approval  
**Implementation must not begin until Oliver approves this plan.**

## 1. Source reconnaissance

Inspect the official TKKG catalogue and TKKG Site archive before implementing extraction logic.

1. Check each source's robots.txt, relevant terms, pagination, and public access restrictions.
2. Identify catalogue page patterns and individual episode URLs.
3. Inspect HTML, structured data, metadata, image references, and any public feed or structured endpoint.
4. Test representative early, middle, and latest episodes.
5. Determine which fields are actually available and how source disagreements should be resolved.
6. Record source coverage, access failures, and limitations. Do not assume a maximum episode number or complete metadata coverage.

The official site is the primary source for official titles and current releases. The archive is a secondary source for historical records and additional metadata. The merge policy must preserve provenance and expose disagreements rather than silently choosing a value.

## 2. Proposed repository structure

    scraper/
      sources/
        tkkg_official.py
        tkkg_site.py
      discovery.py
      normalise.py
      merge.py
      validate.py
      export.py
    data/
      episodes.json
      episodes.csv
      scrape-report.json
    schemas/
      episode.schema.json
    tests/
      fixtures/
      test_discovery.py
      test_sources.py
      test_merge.py
      test_validation.py
      test_export.py
    src/
      app/
      components/
      data/
      storage/
    .github/
      workflows/
        update-catalogue.yml
        deploy-pages.yml

Adjust the structure only after source reconnaissance and initial frontend setup establish the simplest maintainable layout. Do not add unnecessary abstractions.

## 3. Python scraper

Use Python with requests and BeautifulSoup if source inspection confirms ordinary HTML extraction is appropriate. Check for a reliable public structured source before choosing selectors.

Each source adapter will:
- discover catalogue pages and individual episode pages;
- extract source-specific fields into a shared intermediate record;
- record the source URL and extraction timestamp;
- handle missing fields without fabricating values;
- use timeouts, retries with limits, caching, and conservative request rates.

Normalisation will standardise whitespace, URLs, date formats, labels, and empty values while preserving the official German title. Record merging will use the main-series episode number as the primary identity key and retain conflicting source values for review.

## 4. Data model and schema

Create a versioned JSON Schema. Each episode record will contain:
- number: positive integer;
- title: nonempty string;
- series: main-series identifier;
- synopsis: string or null;
- cover_url: URL or null;
- release_date and release_year: nullable date/year fields;
- physical_releases: array of editions, labels, formats, EANs, and other source identifiers;
- tracks: array of titles and optional durations;
- cast: array of speaker names, character names, and source notes when available;
- credits: production roles and credited names;
- ratings: rating value, scale, source, and review count when available;
- sources: source name, URL, retrieval timestamp, and field provenance;
- last_checked: timestamp of successful verification.

The exact nested schema may be refined after examining real source records. Keep scraped catalogue data separate from browser-specific listening state. Generate JSON for the application and CSV for portability.

## 5. Validation and data quality

Validate every record against the schema. Detect:
- duplicate episode numbers;
- missing or empty titles;
- duplicate or conflicting title assignments;
- malformed dates, URLs, EANs, and nested metadata;
- missing episode numbers and unexplained numbering gaps;
- unexpected decreases in catalogue size;
- source failures and suspiciously large changes in field coverage.

Gaps are warnings requiring investigation, not proof that a release exists. Missing values remain null or empty collections. A failed or suspicious scrape must not replace the last valid dataset. Produce a machine readable report and fail the update workflow when critical validation fails.

## 6. Static web application

Use a small React and TypeScript application built with Vite, unless repository reconnaissance identifies a simpler established setup.

Implement:
- searchable and sortable episode list;
- filters for listened and unlistened episodes;
- episode detail view with available metadata and cover reference;
- per-episode listened toggle;
- total listened count and completion percentage;
- optional personal rating and notes;
- export and import of personal progress.

Store listening state in browser local storage, keyed by stable episode number. Catalogue refreshes must not reset listening progress. Include a clear empty state and graceful handling of missing artwork or metadata.

## 7. GitHub Actions

### Catalogue refresh workflow
- Trigger weekly and manually.
- Install a pinned Python environment and dependencies.
- Run unit tests and the scraper.
- Validate the merged catalogue and produce a report.
- Compare with the previous valid dataset.
- Publish generated files only after all critical checks pass.
- Preserve the previous valid dataset on failure and expose diagnostics in the workflow run.

### Build and deployment workflow
- Run type checking, automated tests, and production build.
- Deploy the static build to GitHub Pages after successful validation.
- Ensure the deployed app loads the bundled catalogue without a server.
- Keep workflow permissions limited to the required repository and Pages operations.

The final workflow design should avoid race conditions between scheduled catalogue updates and deployment. A failed scrape must never deploy a partially written catalogue.

## 8. Testing

### Python automated tests
- Parse saved HTML fixtures for both sources.
- Handle missing fields and changed markup.
- Merge source records and preserve conflicting values.
- Validate schema and duplicate numbers.
- Detect gaps and unexpected catalogue shrinkage.
- Ensure source failure does not erase prior valid output.
- Verify deterministic JSON and CSV exports.

### Frontend automated tests
- Search and sorting.
- Listening toggle and filters.
- Progress totals.
- Persistence after reload.
- Import/export of progress.
- Catalogue refresh retaining existing listening state.
- Missing metadata and artwork.

### Manual browser tests
Record exact steps and expected outcomes in the request's testing.md. Oliver records actual results during review.

## 9. Verification and handoff

Run the Python tests, frontend tests, type checking, and production build in the available environment. Verify the GitHub Actions run and Pages deployment separately. Do not claim deployment or live behaviour is verified without evidence. Record any checks that cannot be run.

## 10. Approval gate

Wait for Oliver's explicit approval before writing scraper or application code. If source reconnaissance shows that a source cannot be accessed or a requested metadata category is unavailable, document the evidence and propose the smallest necessary adjustment before proceeding.
