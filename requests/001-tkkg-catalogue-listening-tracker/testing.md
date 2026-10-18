# Manual testing: TKKG catalogue and listening tracker

**Purpose:** Verify catalogue browsing, listening progress, data portability, and safe handling of missing catalogue information after implementation.

## How to record results
Follow the steps and record what actually happened in **Actual result / Oliver's notes**. Do not use per-test status fields. Preserve recorded observations when this file is updated.

---

## Test 1: Browse and search the catalogue

**Purpose:** Confirm the catalogue loads and episode search works.

**Preconditions:** The app is deployed with a validated catalogue.

**Steps**
1. Open the app's GitHub Pages URL.
2. Confirm that the episode list appears.
3. Search for an exact episode title known to be in the catalogue.
4. Search by its episode number.
5. Clear the search field.

**Expected result**
- Episode numbers and titles are displayed.
- Both title and number searches return the expected episode.
- Clearing the search restores the full filtered catalogue.

**Actual result / Oliver's notes:**

---

## Test 2: Mark episodes listened

**Purpose:** Confirm listening state and progress indicators update.

**Preconditions:** Open the app with at least two catalogue entries.

**Steps**
1. Note the displayed listened count and percentage.
2. Mark one episode as listened.
3. Mark a second episode as listened.
4. Filter the catalogue to listened episodes, then to unlistened episodes.

**Expected result**
- The listened count and completion percentage update correctly.
- Each filter displays only matching episodes.
- The same episode is not counted twice.

**Actual result / Oliver's notes:**

---

## Test 3: Persistence after reload

**Purpose:** Confirm progress remains saved locally.

**Preconditions:** At least one episode has been marked listened.

**Steps**
1. Reload the page.
2. Find the previously marked episode.
3. Close and reopen the app in the same browser profile.

**Expected result**
- The listening state and progress totals remain unchanged in the same browser profile.

**Actual result / Oliver's notes:**

---

## Test 4: Export and restore personal progress

**Purpose:** Confirm progress can be backed up and recovered.

**Preconditions:** At least two episodes have different listening states.

**Steps**
1. Export personal progress.
2. Change one episode's listening state.
3. Import the exported progress file.
4. Confirm the relevant episodes and totals.

**Expected result**
- Export produces a readable file.
- Import restores the exported listening state without changing catalogue metadata.
- Invalid or incompatible files are rejected with a clear message and do not erase existing progress.

**Actual result / Oliver's notes:**

---

## Test 5: Missing optional metadata

**Purpose:** Confirm incomplete records do not break the interface.

**Preconditions:** Use a test fixture or catalogue entry with missing synopsis or cover data.

**Steps**
1. Open the affected episode's detail view.
2. Inspect the missing fields.
3. Return to the catalogue and continue searching.

**Expected result**
- Missing information is presented cleanly.
- No broken image layout or misleading invented text appears.
- Other catalogue functions continue to work.

**Actual result / Oliver's notes:**

---

## Test 6: Refresh catalogue without losing progress

**Purpose:** Confirm a catalogue update does not reset listening status.

**Preconditions:** A test dataset and a saved listening state exist.

**Steps**
1. Mark an episode as listened.
2. Load an updated test catalogue that retains that episode and adds another episode.
3. Reopen the app and inspect both episodes.

**Expected result**
- Existing listening status is retained.
- The new episode appears as unlistened by default.
- Progress totals reflect the updated catalogue.

**Actual result / Oliver's notes:**

---

## Test 7: Failed scraper validation

**Purpose:** Confirm a broken scrape cannot replace valid published data.

**Preconditions:** Use a disposable test workflow or local fixture, never modify the live catalogue intentionally.

**Steps**
1. Run the validation workflow with a fixture containing duplicate episode numbers or missing required titles.
2. Inspect the process exit result and generated report.
3. Confirm the prior valid dataset remains unchanged.

**Expected result**
- Validation fails and identifies the issue.
- Invalid data is not published.
- The last valid catalogue remains available.

**Actual result / Oliver's notes:**

---

## General notes / ideas / outstanding issues

_Record feature-wide observations, ideas, or unresolved issues here._
