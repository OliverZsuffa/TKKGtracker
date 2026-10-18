# Request notes: Fix covers and source detail quality

## Initial evidence
- Episode 001 cover reported by Oliver: https://www.tkkg-site.de/uploads/pics/001_01.jpg
- Episode 002 cover reported by Oliver: https://www.tkkg-site.de/uploads/pics/002.jpg
- Example of contaminated episode content: https://audio.tkkg-site.de/post/181374770249/folge-209
- The displayed Tumblr avatar URL is a generic profile image and must not be used as an episode cover.
- Tumblr privacy policy text and social controls are page chrome, not episode synopsis or tracks.
- Request 002 documents that robots.txt for audio.tkkg-site.de returned HTTP 403 and the scraper must fail closed. Do not bypass this restriction.
- Request 002 documents that the official catalogue supplies metadata for episodes 207–217.

## Implementation progress
- Oliver approved implementation on 18 October 2026.
- Archive cover extraction now inspects all image elements, lazy loading attributes, srcset, linked image URLs, and Open Graph/Twitter image metadata. It prioritizes explicit TKKG-Site upload paths and does not synthesize filename patterns.
- Added regression fixtures for the verified episode 001 and 002 cover URLs and a later lazy-loaded cover.
- The scraper no longer parses posts from audio.tkkg-site.de. It records a warning and uses the official catalogue for episodes 207–217, respecting the previously observed robots.txt HTTP 403 restriction.
- Opened PR #3: https://github.com/OliverZsuffa/TKKGtracker/pull/3.
- No generated catalogue was committed and no deployment was performed.

## Verification status
Automated checks and a live diagnostic have not yet been confirmed. Do not mark this request complete until CI passes and representative live records 001, 002, 207, 209, and 217 are checked.

## Implementation outcomes
To be filled in only after approval and actual testing.
