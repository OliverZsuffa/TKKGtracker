# Request notes: Fix covers and source detail quality

## Initial evidence
- Episode 001 cover reported by Oliver: https://www.tkkg-site.de/uploads/pics/001_01.jpg
- Episode 002 cover reported by Oliver: https://www.tkkg-site.de/uploads/pics/002.jpg
- Example of contaminated episode content: https://audio.tkkg-site.de/post/181374770249/folge-209
- The displayed Tumblr avatar URL is a generic profile image and must not be used as an episode cover.
- Tumblr privacy policy text and social controls are page chrome, not episode synopsis or tracks.
- Request 002 documents that robots.txt for audio.tkkg-site.de returned HTTP 403 and the scraper must fail closed. Do not bypass this restriction.
- Request 002 documents that the official catalogue supplies metadata for episodes 207–217.

## Current status
Request and implementation plan created on a focused branch. No code has been changed and no live scrape has been run for this request.

## Implementation outcomes
To be filled in only after approval and actual testing.
