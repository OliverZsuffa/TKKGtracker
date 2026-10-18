# Request notes: Fix live catalogue refresh

## Observed failure
- Refresh run: https://github.com/OliverZsuffa/TKKGtracker/actions/runs/39111424594
- Build/deploy run: https://github.com/OliverZsuffa/TKKGtracker/actions/runs/39111315474
- Report artifact: https://github.com/OliverZsuffa/TKKGtracker/actions/runs/39111424594/artifacts/12130846723
- Fatal error: `Only 142 episodes discovered; refusing to publish a suspiciously small catalogue.`
- Report source counts: 217 archive index entries, 146 official records, 11 archive detail records.
- Report official maximum episode number: 500.
- Archive detail warnings repeatedly show URLs shaped like `https://www.tkkg-site.de/de/hoeren/hoerspiele/de/hoeren/hoerspiele/serie/folge-001/inhalt.html`, which return 404.
- The scraper correctly refused to publish the incomplete result. The failure guard must remain in place.

## Workflow annotations
- checkout/setup-node/setup-python/upload-artifact/deploy-pages versions produced Node.js 20 deprecation warnings.
- `ubuntu-latest` emitted a notice about its planned migration to Ubuntu 26.
- These notices did not cause the scraper failure.

## Implementation progress
- Oliver approved the revised plan on 18 October 2026.
- Fixed archive index link normalization for root-relative, directory-relative, absolute, and previously duplicated paths. Links to `audio.tkkg-site.de` remain on that host.
- Tightened official catalogue parsing so episode headings must belong to a product card with its own cover image. The title is read from that same card instead of borrowing a previous heading elsewhere on the page.
- Added rejection diagnostics with the source page, candidate number, and reason for headings outside product cards or conflicting with the cover image number.
- Added regression tests for archive URL forms, audio subdomain preservation, and the official episode-500 false-positive shapes.
- Updated GitHub Actions to current Node 24 compatible action releases and pinned Ubuntu 24.04 rather than relying on the moving `ubuntu-latest` label.
- GitHub Actions run `39113054506` passed both Python and frontend jobs, including unit tests, `npm audit --audit-level=high`, type checking, Vitest, and production build.
- Branch-only live diagnostic run `39113096661` is running against public source pages. It uploads its report and generated files as an artifact only; it does not commit or deploy them.

## Status
Implementation is underway. The live source result, catalogue completeness, deployment, and browser smoke test are not yet verified.
