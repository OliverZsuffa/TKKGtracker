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

After approval, implement only the approved scope. Run relevant tests and build checks when the environment permits, review the diff, and update the request documents. Never claim a check was run unless it actually was. Preserve Oliver's recorded test results and notes. Once implementation and review are complete, merge the pull request without waiting for another instruction; Oliver will inspect the result after merging. Do not claim tests passed when they were not run, and do not mark a request complete on Oliver's behalf.

## Knowledge base
Reusable architecture, patterns, and lessons belong in docs/knowledge/. Request-specific plans and results stay in the request folder. Approved product or architecture decisions belong in docs/decisions.md. Do not record guesses as facts. Update existing knowledge rather than creating duplicate notes.

## Project constraints
- The app is intended to be static and hosted on GitHub Pages.
- Python scraping runs in GitHub Actions, not in the browser.
- Published catalogue data must pass validation before it replaces the last valid dataset.
- Listening progress and personal notes belong to the user's browser storage and must remain separate from scraped catalogue data.
- Do not invent episode metadata. Preserve provenance and report source disagreements or coverage gaps.
- Treat the numbered regular TKKG main audio drama series as the initial scope. Do not silently include TKKG Junior or unrelated releases.
- Respect source terms, access restrictions, caching, and conservative request rates.
- Keep implementation understandable and avoid unrelated features or dependencies.

## Git workflow
Work on a focused branch for each request. Do not force-push or merge without explicit instruction. Keep commits focused. Verify the current branch and repository state before changing files.
