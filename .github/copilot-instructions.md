# TKKGTracker project instructions

## Start here
Before planning or changing the application, read:
1. README.md
2. docs/README.md
3. docs/knowledge/README.md
4. The active request's request.md, implementation-plan.md, testing.md, and notes.md
5. Any relevant knowledge topics and approved decisions.

## Request and approval workflow
All substantial work must have a request folder under requests/. Each request contains:
- request.md: desired outcome, scope, and acceptance criteria.
- implementation-plan.md: proposed technical approach and affected areas.
- testing.md: concrete manual tests with expected results and space for Oliver's actual observations.
- notes.md: implementation outcomes, tests actually run, remaining issues, and reusable lessons.
- attachments/: relevant reference material when needed.

For a new task, investigate only what is necessary, create or update the request documents, draft request-specific manual tests, summarise the plan, and wait for Oliver's explicit approval before implementing. If a material change to an approved plan becomes necessary, explain it and request approval before proceeding.

After approval, implement only the approved scope on a focused branch. Run relevant tests and build checks when the environment permits, review the diff, and update the request documents. Never claim a check was run unless it actually was. Preserve Oliver's recorded test results. Do not mark a request complete on Oliver's behalf. Do not force-push, merge, or deploy without Oliver's explicit approval.

## Knowledge base
Reusable architecture, patterns, and lessons belong in docs/knowledge/. Request-specific plans and results stay in the request folder. Approved product or architecture decisions belong in docs/decisions.md. Do not record guesses as facts. Update existing knowledge rather than creating duplicate notes.

## Project responsibilities
- TKKGTracker is the user-facing listening tracker and PWA.
- TKKGData is intended to own the canonical shared episode dataset, source scraping, enrichment, schema, validation, and publication.
- TKKGTracker consumes the published TKKGData dataset at build time. The app continues to load the same data/episodes.json URL from its own origin.
- TKKGTracker must not maintain a competing catalogue or source scraper.
- Listening progress, ratings, notes, favourites, and user settings remain local to the user's browser and must never be published to TKKGData.
- Preserve last-known-good catalogue data for offline use and temporary network failures.
- The TKKGData migration is a data ownership change only. Do not change tracker UI, search, filters, episode detail behaviour, progress storage, import/export formats, PWA installation, service worker, or offline behaviour.
- Prefer build-time dataset synchronization over a browser runtime API change. Keep the existing same-origin data URL and cache behaviour.
- Do not implement the consumer migration until TKKGData has an approved, published, validated data contract.
- The current scraper and generated catalogue remain in place until the replacement is proven and the cutover is approved.

## Existing project constraints during migration
- The app is intended to be static and hosted on GitHub Pages.
- The PWA must continue to work offline after a successful catalogue load.
- User progress must remain separate from shared catalogue data.
- Do not invent episode metadata. Preserve provenance and report source disagreements or coverage gaps.
- Respect source terms, access restrictions, caching, and conservative request rates.
- Keep implementation understandable and avoid unrelated features or dependencies.

## Git workflow
Work on a focused branch for each request. Verify the current branch and repository state before changing files. Keep commits focused. Do not force-push, merge, or deploy without Oliver's explicit approval.
