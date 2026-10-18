# TKKGTracker

A static web app for tracking listened episodes of the regular TKKG audio drama series, backed by a Python catalogue scraper and validated JSON data.

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

Reusable project architecture and lessons belong in docs/knowledge/. Read the project instructions and relevant knowledge before planning or changing code.

## Current status

Request 001 contains the approved plan for the catalogue scraper and listening tracker. See requests/001-tkkg-catalogue-listening-tracker/.
