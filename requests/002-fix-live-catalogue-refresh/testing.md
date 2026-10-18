# Manual testing: Fix live catalogue refresh

**Purpose:** Verify that the live catalogue is complete enough to publish and that the deployed tracker uses it.

## Test 1: Archive URL normalization

**Purpose:** Confirm discovered archive links point to valid intended episode pages.

**Preconditions:** The URL normalization fix is implemented and unit tests pass.

**Steps**
1. Run the Python source parser tests.
2. Inspect URLs produced for an early episode and a linked newer episode.
3. Confirm no URL duplicates the `/de/hoeren/hoerspiele/` segment.

**Expected result**
- Early episode URLs resolve to the archive's episode detail path.
- Newer episode URLs remain on the intended `audio.tkkg-site.de` host.

**Actual result:** Python regression tests pass. The live report shows 217 index entries, 206 fetched historical detail pages, no archive detail fetch warnings, and correct URLs for episodes 1, 100, and 206. Episodes 207–217 were not fetched from audio.tkkg-site.de because robots.txt returned HTTP 403; the official catalogue supplies their episode metadata.

---

## Test 2: Official catalogue false-positive handling

**Purpose:** Ensure suspicious numbering is not counted as regular main-series coverage.

**Preconditions:** The official source parser regression fixture is implemented.

**Steps**
1. Run the official source adapter tests.
2. Review report diagnostics for rejected suspicious records.
3. Confirm the reported episode 500 is either explained as valid by source evidence or excluded by a documented, tested rule.

**Expected result**
- The scraper does not treat an unexplained number as proof of coverage.
- Regular main-series records retain their correct episode numbers and titles.

**Actual result:** Tests pass. The official listing's detail content is embedded in collapsed HTML panels linked to their adjacent teaser via data-modal. The listing's episode 500 is the film tie-in “Jede Legende hat Ihren Anfang (Hörspiel zum Kinofilm)” and is excluded. Adventskalender releases, the 209 Neuaufnahme, Die Weihnachtsgeiseln, and the live album are also excluded by source evidence. Verified official detail-page fallbacks supply episodes 222, 223, and 234.

---

## Test 3: Live refresh

**Purpose:** Validate the full catalogue against current public source pages.

**Preconditions:** Unit tests and workflow checks pass.

**Steps**
1. Manually run **Update episode catalogue** in GitHub Actions.
2. Review the refresh log and download the `tkkg-scrape-report` artifact.
3. Confirm the report says `success: true`, no unexplained numbering gaps remain, and the record count matches the discovered regular series.
4. Confirm the JSON and CSV were committed only after validation succeeded.

**Expected result**
- The refresh job succeeds with a validated dataset.
- Failed or incomplete runs do not replace the last valid catalogue.

**Actual result:** Live diagnostic run [39114134477](https://github.com/OliverZsuffa/TKKGtracker/actions/runs/39114134477) succeeded. The generated artifact contains 243 JSON records and 243 CSV rows, covers episodes 1–243 with no gaps, and passes schema validation. The audio-subdomain robots limitation is recorded once in the report. The diagnostic run does not commit or deploy generated data; the main update workflow will do so after merge.

---

## Test 4: Deployment and browser smoke test

**Purpose:** Confirm the public Pages site serves the refreshed catalogue.

**Preconditions:** Test 3 passed and the deployment workflow completed successfully.

**Steps**
1. Open https://oliverzsuffa.github.io/TKKGtracker/.
2. Confirm the episode list is populated and the displayed total matches the generated catalogue.
3. Search by episode number and by a title.
4. Mark one episode as listened, reload, and confirm the state persists.
5. Confirm the completion percentage changes correctly.

**Expected result**
- The site displays the refreshed catalogue and core tracking interactions work.
- No empty catalogue state or broken asset paths appear.

**Actual result:** Not run. The PR has not been merged, so the production Pages deployment and public browser smoke test remain pending.

---

## General notes / ideas / outstanding issues

