# Manual testing: UI redesign, advanced search, and missing-data reports

**Purpose:** Verify that the redesigned tracker is comfortable to use, that advanced filters return the correct episodes, and that personal data remains safe and local.

## Test 1: First impression and default state

**Purpose:** Check that the default view is useful without exposing every advanced control.

**Preconditions:** Open the deployed app with a normal catalogue.

**Steps**
1. Load the app at desktop width.
2. Check the heading, listening progress, basic search, episode list, result count, and primary actions.
3. Confirm advanced search is collapsed by default.
4. Expand advanced search, then collapse it again.

**Expected result**
- The main view is visually coherent and uncluttered.
- Basic search is immediately visible.
- Advanced controls open/close accessibly, and closing the panel does not reset filters.

**Actual result / Oliver's notes:**

---

## Test 2: Basic search, sorting, and listening status

**Purpose:** Confirm existing core behavior remains intact.

**Steps**
1. Search by a known episode number.
2. Search by part of a known title with different letter casing.
3. Apply listened and unlistened filters.
4. Sort by number, title, year, and personal rating.
5. Clear the search and filters.

**Expected result**
- Results and counts update correctly.
- Sorting is stable and sensible for unknown years or unrated episodes.
- Listening state remains intact.

**Actual result / Oliver's notes:**

---

## Test 3: Advanced year, speaker, and character filters

**Purpose:** Check the difference between an actor/speaker and a character.

**Steps**
1. Select a known release year.
2. Select “year missing.”
3. Search for a known speaker/actor from an episode's cast.
4. Search for a known character/role from the same cast.
5. Combine a year, cast filter, and listened status.
6. Close and reopen advanced search.

**Expected result**
- Year and “year missing” searches return appropriate records.
- Speaker searches match cast[].name; character searches match cast[].character.
- Combined filters follow the documented AND/OR rules.
- Filters persist when the panel is collapsed and remain summarised.

**Actual result / Oliver's notes:**

---

## Test 4: Find episodes with missing metadata

**Purpose:** Use the tracker to discover catalogue gaps.

**Steps**
1. Filter for missing synopsis.
2. Filter for missing cover art.
3. Filter for missing cast or tracks.
4. Filter for missing release year and separately missing exact release date.
5. Compare result counts and inspect several episodes.

**Expected result**
- Missing-field filters return records with genuinely absent/empty values.
- Release year and exact date are treated separately.
- The UI does not invent metadata or confuse “not in catalogue” with “does not exist.”

**Actual result / Oliver's notes:**

---

## Test 5: Search for an absent speaker or character and draft a report

**Purpose:** Make suspected omissions easy to communicate.

**Steps**
1. Search for a deliberately unmatched speaker or character name.
2. Confirm the empty state explains that no match was found in the current catalogue.
3. Choose “Report missing information.”
4. Inspect the prefilled query and filters, select a relevant field/category, and add an optional note.
5. Download the report and open it.

**Expected result**
- The report contains the query, active filters, optional episode reference, selected suspected field, and user note.
- User suspicion is explicitly marked as unverified.
- The downloaded Markdown/JSON is readable and does not claim the omission is verified.
- No automatic upload or network submission occurs.

**Actual result / Oliver's notes:**

---

## Test 6: Star ratings and personal notes

**Purpose:** Check interaction quality and persistence.

**Steps**
1. Open an episode detail view.
2. Set a rating using the pointer.
3. Set/change the rating using the keyboard.
4. Clear the rating.
5. Enter personal notes, close the detail view, and reopen it.
6. Reload the page.

**Expected result**
- Stars show the current integer rating out of five with accessible text.
- Rating can be changed and cleared.
- Notes and ratings persist after reopening/reload and remain explicitly local/private.
- No rating or note is sent to the catalogue or another user.

**Actual result / Oliver's notes:**

---

## Test 7: Existing progress import/export compatibility

**Purpose:** Protect previously stored listening state.

**Steps**
1. Use a progress export created before the redesign, if available.
2. Import it into a browser profile with test data.
3. Verify listened status, personal rating, and notes.
4. Export the progress again and inspect the JSON format.
5. Reload the app.

**Expected result**
- Existing tkkgtracker-progress/v1 exports import successfully.
- The tkkgtracker.progress.v1 local storage format is preserved.
- No pre-existing data is silently lost or renamed.

**Actual result / Oliver's notes:**

---

## Test 8: Responsive layout, accessibility, and edge cases

**Purpose:** Check robustness beyond the happy path.

**Steps**
1. Test at 320 px, phone, tablet, and desktop widths.
2. Navigate controls using only the keyboard.
3. Check focus indicators and screen-reader labels for the advanced-search disclosure and star rating.
4. Inspect an episode with no cover, missing metadata, and long credits/title.
5. Trigger an empty result and reset it.
6. Check reduced-motion behavior and report dialog close/focus return.

**Expected result**
- No horizontal overflow or clipped primary controls.
- Keyboard focus is visible and controls have meaningful accessible names.
- Missing/broken cover images do not break the layout.
- Empty states and dialogs are understandable and operable.

**Actual result / Oliver's notes:**

---

## General notes / ideas / outstanding issues

_Record feature-wide observations or unresolved issues here._
