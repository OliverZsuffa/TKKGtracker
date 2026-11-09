# Approved decisions

## 001. TKKGData owns shared episode data

Oliver approved the three-repository migration on 2026-11-09. TKKGData owns episode metadata, source scraping, enrichment, validation, provenance, and publication. TKKGTracker owns the app and local personal progress. TKKGDownloader owns download execution and local files.

## 002. Preserve TKKGTracker functionality

The tracker migration must not change its user-visible or local behaviour. Keep the existing episode JSON array shape, same-origin runtime path, UI, search, filters, progress storage, import/export formats, PWA installation, service worker, and offline behaviour. The deployment fetches TKKGData at build time and publishes it at the existing same-origin URL.

## 003. Keep a local last-known-good catalogue fallback

TKKGTracker retains data/episodes.json as a development and initial-render fallback. It is not independently scraped or maintained. The deployment workflow replaces its build input with a validated TKKGData dataset before building.
