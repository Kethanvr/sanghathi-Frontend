# Sanghathi - Netlify Retained, Cloudflare Cache Rules, and Deploy Visibility

Date: 2026-04-18
Report ID: 019
Type: Deployment operations and cache configuration log
Status: Completed

## Update Summary

Captured the deployment model confirmation and the Cloudflare cache setup decisions for `sanghathi.com` while keeping frontend hosting on Netlify. Logged the exact rule strategy used to ensure new frontend deploys become visible quickly while preserving static asset performance.

## What Was Wrong

- Deployment mode (Docker/Fly vs Netlify/Vercel) needed explicit confirmation in logs.
- Cloudflare cache setup steps were discussed in chat but not recorded in kethan logs.
- Requirement "new frontend deploy changes should be visible directly" needed a concrete, repeatable rule set documented.

## What Was Fixed

1. Deployment model confirmed and logged:
- Backend: Docker image deployment on Fly.io (Bun runtime).
- Frontend: Static deployment on Netlify.
- Vercel config exists as fallback rewrite support, but Netlify remains active platform.

2. Cloudflare caching strategy finalized for `sanghathi.com` and `www.sanghathi.com`:
- Baseline caching level: Standard.
- Rule 1 (higher priority): Bypass cache for HTML (`/`, `/index.html`, and `*.html`).
- Rule 2: Cache static assets (`/assets`, JS/CSS/fonts/images/maps) with long edge TTL.

3. Immediate deploy visibility objective addressed:
- By bypassing HTML at Cloudflare edge, each request fetches fresh HTML from origin.
- New Vite hashed asset filenames then load immediately after deploy, while static files stay fast via edge caching.

4. Operational guardrails documented:
- Keep Cloudflare proxy enabled (orange cloud) for cache rules to apply.
- Keep rule order with HTML bypass above static asset caching.
- Purge cache once after first-time rule rollout to clear legacy edge entries.

## File Change Statistics

- Files added: 1
- Files updated: 1
- Files removed: 0
- Total touched: 2

## Files Changed

- `sanghathi-Frontend/docs/kethan/2026-04-18-019-netlify-keep-cloudflare-cache-rules-and-deploy-visibility.md`
- `sanghathi-Frontend/docs/kethan/README.md`

## Verification and Test Results

- Verified repository deployment config alignment:
  - Backend Docker build/start file present in `sanghathi-Backend/Dockerfile`.
  - Frontend Netlify build/publish config present in `sanghathi-Frontend/netlify.toml`.
  - Frontend SPA rewrite fallback present in `sanghathi-Frontend/vercel.json`.
- Verified kethan log index now includes report 019.
- No runtime code changes made; this is a deployment operations documentation update.

## Risks or Follow-up Items

- If any old Cloudflare Page Rule still enforces "Cache Everything", it can override expected behavior; keep rule set clean.
- If Browser TTL is forced too high for HTML in another rule, users may still see stale pages locally.
- After major cache-policy edits, perform one controlled purge and then avoid frequent global purges.
