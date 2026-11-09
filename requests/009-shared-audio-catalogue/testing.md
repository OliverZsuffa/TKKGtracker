# Manual testing: Shared TKKG audio catalogue

**Purpose:** Verify that TKKGtracker discovers and publishes reliable Spotify and YouTube Music pairings in the central episode dataset.

## How to record results
For each test, write the actual outcome in **Actual result / Oliver's notes**. There is no per-test status field. Preserve Oliver's observations and the general notes at the bottom when revising this document.

---

## Test 1: Episode 150 discovery

**Purpose:** Verify the known case that exposed spotDL's text-search failure.

**Preconditions:** The discovery implementation is available. Network access is available.

**Steps**
1. Run audio discovery for episode 150 in dry-run mode.
2. Inspect the Spotify album candidate and YouTube Music playlist candidate.
3. Confirm the playlist URL resolves to playlist ID `OLAK5uy_mQRbJNANh1H4CKbmM5ez5LSW1HJFvE3QI`.
4. Inspect the actual returned playlist tracks and compare them with the Spotify album track records.
5. Confirm the verified track sequence contains all 40 parts.

**Expected result**
- The correct episode and album are identified.
- The playlist candidate is verified only after the complete ordered track comparison passes.
- The production logic derives the count from actual validated records and does not hardcode 40 or trust the inconsistent summary count of 25.

**Actual result / Oliver's notes:**

First live dry-run in GitHub Actions installed FFmpeg and completed the spotDL Spotify lookup. It stopped before YouTube Music search because the returned Spotify track numbers did not form a complete unique sequence. A second diagnostic run is in progress to report the actual track numbers and disc numbers. No mapping was saved. The playlist ID has not yet been checked by the automated discovery run.

---

## Test 2: Automatic discovery without a supplied playlist URL

**Purpose:** Confirm that discovery does not depend on manually entering a playlist link.

**Preconditions:** Choose an episode that has a public official playlist and does not yet have an audio mapping.

**Steps**
1. Run discovery for the selected episode without supplying any Spotify or YouTube Music URL.
2. Inspect search candidates and the selected result.
3. Confirm the selected playlist is for the exact episode.

**Expected result**
- The program finds candidates automatically.
- A verified result is saved only when identity and track-list checks pass.
- If multiple candidates remain plausible, the episode is reported as ambiguous and no mapping is saved.

**Actual result / Oliver's notes:**

---

## Test 3: Representative historical coverage

**Purpose:** Check that the discovery method works across different release eras.

**Preconditions:** Select one early, one middle-era, and one recent regular main-series episode.

**Steps**
1. Run discovery in dry-run mode for all selected episodes.
2. Review the Spotify and YouTube Music candidates.
3. Compare titles, artists, track counts, and ordered parts.
4. Record any era-specific differences or unavailable sources.

**Expected result**
- Correct candidates are verified where evidence is sufficient.
- Missing or ambiguous sources are reported without fabricated links.
- One era's source format does not silently break another era's records.

**Actual result / Oliver's notes:**

---

## Test 4: Provider failure and preservation

**Purpose:** Ensure optional audio discovery cannot damage the main catalogue.

**Preconditions:** Use a test fixture or controlled mock that simulates YouTube Music or Spotify being unavailable. Include an episode with an existing verified mapping.

**Steps**
1. Run the normal catalogue refresh with the provider failure simulated.
2. Inspect the resulting episode record and scrape report.
3. Validate the catalogue.
4. Compare the previously verified audio mapping before and after the refresh.

**Expected result**
- The normal episode catalogue remains valid and can be published.
- The provider failure appears in diagnostics.
- The existing verified audio mapping remains unchanged.

**Actual result / Oliver's notes:**

---

## Test 5: Dataset consumption contract

**Purpose:** Confirm that downstream tools can consume the shared data without a separate playlist mapping.

**Preconditions:** At least one verified audio mapping has been published.

**Steps**
1. Open the public raw `episodes.json` URL.
2. Find an episode with a verified `audio_release` object.
3. Compare the stored Spotify and YouTube Music URLs with the verified sources.
4. Construct the documented spotDL manual-pair query using the two stored URLs.
5. Test the pair with the spotDL version used by TKKGDownloader.

**Expected result**
- The published JSON contains the complete verified pairing.
- Both URLs and IDs agree.
- The documented spotDL query accepts the pairing.
- No separate playlist database or manually maintained mapping is needed.

**Actual result / Oliver's notes:**

---

## General notes / ideas / outstanding issues

- Python unit tests: 50 passed on the implementation branch.
- Frontend CI is currently blocked at `npm install` by npm 10.9.9 throwing `Cannot read properties of null (reading 'edgesOut')`. Frontend typecheck, tests, and build have not run in those CI attempts.
- The live discovery process must resolve the Spotify track-number discrepancy before YouTube Music playlist matching can be assessed.

