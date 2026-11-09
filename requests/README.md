# Development requests

Every substantial change is tracked in its own request folder.

## Workflow
1. Investigate only what is needed to understand the request.
2. Read project instructions and relevant knowledge.
3. Create request.md, implementation-plan.md, testing.md, and notes.md.
4. Present the plan and wait for explicit approval.
5. Implement only the approved scope on a focused branch.
6. Run relevant checks, review the diff, and document actual outcomes.
7. Leave the request ready for Oliver's review. Do not mark it complete on his behalf.
8. Merge only after verification and Oliver's explicit approval.

## Request index

- [010: Make TKKGTracker a TKKGData consumer](010-tkkgdata-consumer/request.md) — consume the shared dataset at build time while preserving all tracker behaviour.
- [009: Shared TKKG audio catalogue](009-shared-audio-catalogue/request.md) — historical request transferred to TKKGData. Its implementation and research now live in the TKKGData repository.
- [008: Installable PWA](008-installable-pwa/request.md)
- [008: Clean progress export](008-clean-progress-export/request.md)
- [007: Episode streaming links](007-streaming-links/request.md)

## Request contents
- request.md: desired outcome, scope, and acceptance criteria.
- implementation-plan.md: technical approach and verification plan.
- testing.md: concrete manual tests and expected results. Oliver records actual results and notes.
- notes.md: implementation outcome, checks actually run, and remaining work.
- attachments/: reference files when needed.

Request-specific details stay with the request. Reusable knowledge belongs in docs/knowledge/, and explicitly approved durable decisions belong in docs/decisions.md.
