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

## Status
Diagnosis is underway. No code changes have been made for this follow-up request. Implementation plan is awaiting Oliver's explicit approval.
