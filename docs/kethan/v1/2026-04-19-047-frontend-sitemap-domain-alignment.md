# Frontend Sitemap Domain Alignment For Search Console

Date: 2026-04-19
Owner: GitHub Copilot

## What Was Wrong
- Sitemap URLs used the `www` host while the active Google Search Console property is configured for the apex domain (`sanghathi.com`).
- `robots.txt` also pointed to the `www` sitemap URL and host.
- One public route (`/forgot-password`) was not listed in the sitemap.

## What Was Fixed
- Updated all sitemap `<loc>` entries to use `https://sanghathi.com`.
- Added `/forgot-password` to sitemap as an indexable public route.
- Updated `robots.txt` directives:
  - `Sitemap: https://sanghathi.com/sitemap.xml`
  - `Host: https://sanghathi.com`

## Files Changed
- public/sitemap.xml
- public/robots.txt

## Verification / Tests
- Manually verified updated sitemap content and robots directives in both files.
- Confirmed both edited files are tracked in git status.

## Next Steps
- In Google Search Console (for `sanghathi.com`), submit: `sitemap.xml`.
- After deployment, verify:
  - `https://sanghathi.com/sitemap.xml`
  - `https://sanghathi.com/robots.txt`
- Optional improvement: automate sitemap generation from a public-route source to avoid manual updates.
