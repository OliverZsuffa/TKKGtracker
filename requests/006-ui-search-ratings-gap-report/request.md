# Request 006: Redesign the tracker UI, ratings, and advanced search

## Status
Awaiting approval

## Desired outcome
Turn TKKGTracker from a functional catalogue prototype into a polished, genuinely useful and well-tested listening archive. Improve the episode list and detail view, replace the plain personal rating selector with an attractive accessible five-star control, present personal notes/comments more clearly, and add powerful catalogue search and data-gap discovery without overwhelming everyday use.

## Context
The current React/TypeScript app has a single basic search field, listened-status and sort selectors, a modal episode detail view, and local-only personal ratings and notes. The catalogue already exposes release year/date, cast entries (name = speaker/actor, character = role in the episode), synopsis, tracks, credits, physical-release metadata, sources, and cover URLs, but many fields are legitimately null or empty. Personal state is stored in browser local storage and exported/imported as JSON.

Relevant constraints:
- The app is static and hosted on GitHub Pages; there is no backend or user account.
- Personal listening progress, ratings, and notes must remain separate from scraped catalogue data.
- Search and gap reports must reflect the currently published catalogue and must not invent facts about releases or people.

## Required behaviour

### 1. Cohesive UI/UX redesign
- Establish a consistent visual hierarchy, spacing, typography, colours, control states, and component styling across the catalogue, filters, episode details, ratings, notes, and import/export controls.
- Make the catalogue comfortable to scan, with clear episode number/title, year where known, listened status, rating where personally set, and cover handling when artwork is missing or fails to load.
- Improve the episode detail view so metadata is organised into understandable sections and missing data is labelled plainly rather than represented as broken or misleading content.
- Make the layout responsive on narrow mobile screens and wide desktop screens.
- Preserve the current product identity and existing functionality rather than redesigning the app into an unrelated product.
- Provide clear focus indicators, keyboard access, readable contrast, meaningful accessible names, reduced-motion support, and useful empty/loading/error states.
- Do not add heavy UI frameworks or unnecessary runtime dependencies.

### 2. Personal star rating and notes/comments
- Replace the plain dropdown for personal ratings with an attractive five-star rating control.
- Support keyboard and screen-reader use, clear selected/unselected states, and an obvious way to clear a rating.
- Show the selected rating consistently in the episode detail view and, where it improves scanning, on episode rows/cards.
- Retain personal per-episode notes/comments, presenting them as a comfortable editor with clear saved/local status and no accidental loss on navigation.
- Keep ratings and notes private to the current browser profile through the existing local-storage model. They are not public comments and are not synchronised between users.
- Preserve compatibility with existing tkkgtracker.progress.v1 records and existing progress export/import. A UI redesign must not silently discard old ratings, notes, or listening status.

### 3. Fast basic search, advanced search hidden by default
- Keep the basic search field immediately visible and useful for episode number and title.
- Add an accessible “Advanced search and filters” disclosure, collapsed by default.
- Advanced options should include:
  - Release year: a specific year and an explicit “year missing” option.
  - Speaker/actor: search/select against cast[].name.
  - Character/role: search/select against cast[].character. Label the difference between the actor/speaker and the character clearly.
  - Listened status.
  - Metadata availability filters for missing release year/date, synopsis, cover, cast, tracks, production credits, and physical-release information.
  - Search within synopsis, track titles, and production credits where practical.
  - Sensible sorting, including episode number, title, year, and personal rating when applicable.
- Combine active filters predictably (AND between selected filter categories); allow multiple speaker/character selections only if the interface makes the logic obvious.
- Show the number of matching episodes, active filter chips or an equivalent summary, and a one-action “Clear filters” control. Keep active filters visible even when the advanced panel is collapsed.
- Distinguish “no catalogue records match this search” from “records exist, but the selected metadata is missing.” Do not imply that a zero-result search proves a person or episode does not exist outside the catalogue.

### 4. Missing-information discovery and reporting
- Make it easy to find episodes with missing catalogue fields using the metadata availability filters.
- Include a useful data-quality view/state that shows which episodes are missing the selected field, rather than simply hiding them.
- When a speaker, character, title, or other search returns no match, offer a lightweight way to draft a missing-information report rather than making the user reconstruct the search manually.
- The report should capture the search term, active filters, relevant episode number/title when known, the missing field or suspected omission, and an optional user note.
- Allow the report to be downloaded as a Markdown or JSON file that Oliver can share in a GitHub issue or ChatGPT conversation. Do not attempt to send it automatically or add a backend.
- Reports must distinguish user-supplied suspicions from verified catalogue facts.

### 5. Preserve existing functionality
- Keep listened/unlistened tracking, completion statistics, episode details, source links, progress import/export, and local persistence.
- Keep catalogue data source-driven; do not hard-code current episode numbers, years, actors, or character lists into UI controls.
- Keep null/missing metadata honest and allow it to be searched.

## Scope

### Included
- Request-specific UI and interaction design in the existing React/TypeScript application.
- Refactor reusable components and pure search/filter logic as needed.
- Five-star personal rating UI and improved personal notes/comments editor.
- Collapsed-by-default advanced filters, metadata-missing searches, result summaries, and useful empty states.
- Downloadable missing-information report drafts.
- Automated unit/component tests, responsive/accessibility checks where practical, and a manual browser test guide.
- Update this request's notes after implementation and record only reusable architectural lessons in docs/knowledge/.

### Not included
- Public comments, shared community ratings, accounts, cloud sync, backend/API, or server database.
- Changes to scraper/source extraction rules or episode catalogue contents, except to consume the existing schema correctly.
- Rewriting the scraper, changing the release catalogue scope, or adding new data sources.
- Audio playback, downloading audio, or third-party analytics.
- Unrelated changes to deployment or repository automation.

## Acceptance criteria
- [ ] The default catalogue view is clear and uncluttered; advanced filters start collapsed.
- [ ] Basic search, status filtering, sorting, and episode details continue to work.
- [ ] Advanced filters correctly support release year/missing year, speaker name, character name, and metadata availability.
- [ ] Users can find episodes missing selected metadata and see how many records match.
- [ ] A zero-result search has a clear explanation, an easy reset action, and a way to draft a missing-information report.
- [ ] A report can be downloaded and contains the search context and user-supplied suspicion without presenting it as verified fact.
- [ ] Personal rating uses an accessible five-star control with a clear/reset action.
- [ ] Personal notes/comments remain editable, persist after reload, and are clearly local/private.
- [ ] Existing local progress and export/import records remain compatible without losing data.
- [ ] The UI works at mobile and desktop widths, including long titles and missing/broken cover images.
- [ ] Automated tests cover search/filter combinations, missing-metadata results, report generation, rating updates, and storage compatibility.
- [ ] Type-check, test suite, production build, and dependency audit pass.
- [ ] Manual testing steps and actual outcomes are documented; deployment is verified before reporting completion.

## Open questions
No blocking question is assumed for this plan. “Comments” means the existing private per-episode notes, not public comments, because the current app has no backend or account system. The missing-information report is an export for the user to share, not an automatic submission.
