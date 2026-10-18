# TKKGTracker

A static web app for tracking listened episodes of the regular TKKG audio drama series, backed by a Python catalogue scraper and validated JSON data.

## Install on Android

TKKGTracker can be installed from its GitHub Pages website as a Progressive Web App (PWA). Open the deployed site in Chrome on Android, open the browser menu, and choose **Install app** (wording can vary by Chrome version). Launch it from the new app icon.

Use the app normally. Listening status, ratings, and notes remain stored locally in the browser/app on that device. Use **Export progress** and **Import progress** to back up or move them; there is no account or cloud sync.

The app can use the last successfully cached catalogue offline after it has loaded online once. Catalogue refreshes still come from the same weekly GitHub Actions scraper. Offline mode does not make external streaming services available without internet access. When online, open the app with a connection so Chrome can check for app updates and the tracker can load the latest catalogue.

If Chrome does not offer **Install app**, first open the actual HTTPS website in Chrome (not an in-app browser), reload it while online, and check the browser menu again.

## Local development

Requirements: Python 3.12 or later and Node.js 22 or later.

Install dependencies:

    pip install -r requirements.txt
    npm install

Run the scraper in an environment with network access:

    python -m scraper.run

Run checks:

    python -m unittest discover -s tests -v
    npm run typecheck
    npm test
    npm run build

Start the development server:

    npm run dev

The scraper respects each source's robots.txt, uses conservative request pacing, and records source provenance. If a source cannot be checked or a catalogue fails validation, it must not replace the previously valid episode list.

## Project workflow

Substantial work is tracked under requests/. Each request has a desired outcome, implementation plan, manual testing instructions, and outcome notes. Implementation requires explicit approval of the plan.

Reusable project architecture and lessons belong in docs/knowledge/. Read the project instructions and relevant knowledge before new planning.

## Current status

Request 001 contains the approved plan for the catalogue scraper and listening tracker. See requests/001-tkkg-catalogue-listening-tracker/.
