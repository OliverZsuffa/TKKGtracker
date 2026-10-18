# Implementation plan: UI redesign, advanced search, and missing-data reports

**Status:** Draft — awaiting Oliver's explicit approval. No application code is changed by this plan.

## 1. Repository findings

- Frontend: React 19 + TypeScript + Vite; styles are currently in src/styles.css.
- App is currently concentrated in src/App.tsx; progress types live in src/types.ts, local storage/import/export in src/storage.ts.
- Catalogue data is bundled from data/episodes.json and typed in src/types.ts.
- Episode.cast contains name (speaker/actor) and optional character (the role/character). These must be separate filters with explicit labels.
- release_year, release_date, synopsis, cover, tracks, cast, credits and physical releases can be missing; absence is legitimate and must remain searchable.
- Personal ratings and notes are stored in tkkgtracker.progress.v1; export/import uses tkkgtracker-progress/v1. Preserve these formats and current data.
- Existing test tooling is Vitest with jsdom; current tests cover storage import/export validation but there are no component-test helpers in package.json.
- The app is static on GitHub Pages. Reports must be generated client-side; no backend or public comments are introduced.

## 2. UX direction

Build a coherent archive interface rather than layering more controls onto the current toolbar.

### Catalogue page
- Keep the main title, listening progress, and a prominent basic search as the primary entry points.
- Use a refined responsive layout with a clear content width, consistent spacing, calmer visual grouping, and consistent buttons/inputs/labels.
- Keep the episode catalogue dense enough to scan but not cramped. Ensure number, title, year, listened state, and personal rating have a predictable hierarchy.
- Include a concise results count and active-filter summary near the list.
- Make empty results actionable: explain what was searched, provide “Clear search and filters,” and offer “Report missing information” when relevant.
- Handle absent/broken cover art and unknown year without shifting the row layout or implying a fabricated value.

### Advanced search
- The advanced panel is a semantic disclosure (button with aria-expanded and aria-controls, or equivalent native disclosure), collapsed on initial load.
- Basic search remains independent and immediately available.
- Provide separate searchable selectors/inputs for release year, speaker/actor, and character/role. Populate year and names from actual catalogue data at runtime; never hard-code a presumed list.
- Include a missing-metadata selector or grouped checkboxes for release year, exact release date, synopsis, cover, cast, tracks, credits, and physical releases.
- Include optional text scopes for synopsis, track titles, and production credits.
- Keep filters deterministic: text search and each active filter category are combined with AND; alternatives within one multi-select category use OR. Document the behaviour in UI labels/help text where needed.
- Provide visible active-filter chips/summary and a clear-all action. Closing the panel must not clear its filters.
- Support useful sort modes (episode number ascending/descending, title, year, and personal rating). Define how unknown years/ratings sort and test it explicitly.

### Episode detail and personal state
- Organise episode metadata into sections: overview, releases, tracks, cast, production credits, source links, and personal notes. Hide truly empty sections where appropriate but offer a clear “not available in catalogue” state when the user is specifically inspecting a field or using gap search.
- Replace the personal-rating dropdown with a five-star control. Use labelled keyboard-operable buttons/radio semantics, a clear-rating action, and a textual value such as “4 out of 5” so the score is not conveyed by colour or stars alone.
- Support pointer hover preview only as a nonessential enhancement; committed rating must change on explicit activation, not on hover. Avoid introducing half-star semantics unless the existing data model is explicitly expanded (it currently uses integer 1–5).
- Improve notes/comments with a clear label, sensible textarea sizing, and a local-only indicator. Save through the existing updateEpisode / local-storage pathway; do not add a separate comments backend.
- Add appropriate save/error feedback if storage writes can fail; never imply cloud synchronisation.

## 3. Search/filter architecture

- Extract pure, independently testable search and filter functions from the large App.tsx component, for example into src/search.ts plus src/search.test.ts.
- Define a typed search state for the basic query, release-year mode/value, selected speaker names, selected character names, metadata-missing fields, optional synopsis/track/credit text, listened state, and sort mode.
- Build available filter options from the loaded episode data, normalising whitespace/case for matching while preserving display names.
- Use safe null-aware matching for every optional field and diacritics-friendly, case-insensitive text matching where practical.
- Apply filters in a single documented pipeline; avoid mutating the shared episodes array while sorting.
- Return both matching records and enough summary metadata for the UI to say how many results were found and which filters are active.
- Add a distinct missing-data mode: selecting a missing field returns episodes where that field is absent/empty, rather than excluding them. Treat release year and exact release date as different fields.
- Make “missing cast” distinct from searching for a specific actor/character that is not in the dataset. A zero-result name search means “no match in this catalogue,” not proof that the person does not exist.

## 4. Missing-information report

- Create a small typed report model and a pure formatter, for example src/gapReport.ts and src/gapReport.test.ts.
- Report fields should include schema/version, creation timestamp, current search query, active filters, optional episode number/title, target field/category, the user's description, and a clear statement that the report is an unverified user observation.
- Offer a simple accessible form/dialog from zero-results and missing-data views. Keep it short: prefill the current query and filters, let the user select what seems missing and add context, and allow episode selection where applicable.
- Generate a Markdown report that is easy to paste into ChatGPT/GitHub, and optionally a JSON version for structured future triage. Download locally via Blob/object URL; do not send automatically.
- Escape user text safely in Markdown output and avoid putting HTML into the generated report. Test punctuation, multiline notes, absent episode selection, and an empty query.
- The report should not change catalogue data or browser listening progress.

## 5. Component structure and styling

Refactor only as much as needed for clarity. Candidate components:
- AdvancedSearchPanel
- StarRating
- EpisodeRow or EpisodeCard
- EpisodeDetail
- MissingInformationReport
- reusable empty-state / filter-chip pieces

The exact component split should follow actual JSX complexity; avoid creating a component for every wrapper. Keep the data transformations in pure helpers and the local persistence path centralised.

Create consistent CSS tokens for surface, border, text, muted text, accent, spacing, radius, and focus states. Ensure responsive behaviour around narrow phones and medium screens. Prefer CSS and existing React/TypeScript over adding a component framework or icon dependency. Keep reduced-motion support and add explicit disabled/hover/focus states.

## 6. Accessibility and responsive checks

- All inputs have visible or screen-reader labels.
- Advanced-search disclosure exposes its expanded/collapsed state.
- Filter chips can be removed by keyboard and have descriptive names.
- Star rating supports keyboard selection and has a textual accessible value; clearing is an accessible action.
- Results count and import/save/report feedback use suitable live-region semantics without announcing every keystroke excessively.
- Focus is managed sensibly when opening/closing the report dialog and episode detail view; Escape closes dialogs, and focus returns to the trigger.
- Dialogs do not trap users behind an inaccessible backdrop.
- Check 320 px mobile, typical phone, tablet, and desktop widths; long titles, many credits, no cover, and no matching results must not cause horizontal overflow.
- Honour prefers-reduced-motion and verify focus visibility/contrast in both normal and interactive states.

## 7. Testing plan

### Automated tests
- Pure search tests for number/title, case/diacritics, speaker vs character, year, missing year/date, listened state, synopsis, tracks, credits, and combinations of filters.
- Sorting tests including unknown years and unrated episodes.
- Missing-data tests for null, empty arrays, whitespace-only strings, and optional fields.
- Gap-report tests for generated content, prefilled query/filters, user-entered claims marked as unverified, and safe multiline/special-character handling.
- Star-rating tests for selecting, changing, clearing, keyboard operation, and accessible labels.
- Component tests for advanced panel default-collapsed state, filter persistence when the panel is closed, result count, empty states, and reset behavior.
- Storage compatibility tests proving existing tkkgtracker.progress.v1 values, ratings, notes, import and export are unchanged by the UI refactor.
- Full CI gate: npm run typecheck, npm test, npm run build, and npm audit --audit-level=high.

If component testing needs an added dev dependency, prefer a small React Testing Library setup and explain why in the PR; do not add a UI component framework. Lock down the dependency changes in the same request.

### Manual browser tests
Use testing.md to check mobile/desktop layouts, filter combinations, missing-data searches, keyboard-only operation, rating and notes persistence, export/import compatibility, report downloads, and broken/missing artwork.

## 8. Implementation sequence after approval

1. Inspect current branch state and baseline tests; make a focused request branch based on the current main.
2. Add pure search state/types and testable filtering/sorting helpers first.
3. Implement the collapsed advanced-search UI, result summary, filter chips, and clear/reset/empty states.
4. Implement the star rating and improved private notes UI without changing storage/export schemas.
5. Implement missing-information report generation and the accessible report flow.
6. Refactor styles and responsive behaviour across catalogue and detail view.
7. Add component tests and expand existing storage/search tests.
8. Run type-check, automated tests, build, dependency audit, and review changed files for unintended scope.
9. Deploy via existing GitHub Actions only after checks pass; verify the live app and catalogue behavior.
10. Record actual outcomes in this request's notes.md. Update reusable knowledge only for architectural lessons that will matter to future work.

## 9. Non-goals and guardrails

- Do not change the episode scraper, schema, or generated catalogue as part of this UI request.
- Do not treat an empty search as proof of real-world nonexistence.
- Do not expose private ratings or notes to other users.
- Do not add server services, analytics, public posting, or account features.
- Do not mark the request complete or merge the work without Oliver's explicit instruction.
