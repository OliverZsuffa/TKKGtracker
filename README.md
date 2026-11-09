# TKKGTracker

A static web app for tracking listened episodes of the regular TKKG audio drama series. Shared episode metadata is maintained in TKKGData and synced into the existing app data file during deployment.

## Install on Android

TKKGTracker can be installed from its GitHub Pages website as a Progressive Web App (PWA). Open the deployed site in Chrome on Android, open the browser menu, and choose **Install app** (wording can vary by Chrome version). Launch it from the new app icon.

Use the app normally. Listening status, ratings, and notes remain stored locally in the browser/app on that device. Use **Export progress** and **Import progress** to back up or move them; there is no account or cloud sync.

The app can use the last successfully cached catalogue offline after it has loaded online once. The deployment workflow fetches and validates the latest catalogue from TKKGData, then publishes it at the same-origin URL used by the app today. The app interface, browser storage, service worker, and offline behaviour are unchanged. Offline mode does not make external streaming services available without internet access. When online, open the app with a connection so Chrome can check for app updates and the tracker can load the latest catalogue.

If Chrome does not offer **Install app**, first open the actual HTTPS website in Chrome (not an in-app browser), reload it while online, and check the browser menu again.

## Local development

Requirements: Node.js 22 or later.

Install dependencies:

    npm install

Sync the latest shared catalogue from TKKGData:

    npm run sync:data

Run checks:
    npm run typecheck
    npm test
    npm run build

Start the development server:

    npm run dev

TKKGData owns all scraping, source access, provenance, validation, and publication. TKKGTracker consumes its published JSON dataset. The local data/episodes.json file remains a last-known-good fallback for development and initial rendering, not an independently maintained catalogue.

## Project workflow

Substantial work is tracked under requests/. Each request has a desired outcome, implementation plan, manual testing instructions, and outcome notes. Implementation requires explicit approval of the plan.

Reusable project architecture and lessons belong in docs/knowledge/. Read the project instructions and relevant knowledge before new planning.

## Current status

Request 010 records the completed migration to TKKGData. The app source and existing tracker behaviour remain unchanged. TKKGTracker continues to own only the app, local listening progress, and user preferences.
