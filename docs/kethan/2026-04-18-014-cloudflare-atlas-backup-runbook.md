# Sanghathi - Cloudflare Update and Atlas Backup Runbook

Date: 2026-04-18
Report ID: 014
Type: Infra documentation + backup operations
Status: Completed

## Update Summary

Documented Cloudflare migration updates, confirmed existing local backup artifacts, and added Atlas-only backup command flow (no local Mongo container required).

## What Was Wrong

- Infra updates (Hostinger nameserver -> Cloudflare, Cloudflare caching/analytics setup) were not captured in project logs.
- Existing backup scripts focused on local-sync flow and could be confusing for Atlas-only workflows.
- Team run commands for frontend/backend and Atlas backup-verification steps were not in a single clear runbook.

## What Was Fixed

1. Logged infrastructure update (as owner-reported operational change):
- Nameserver moved from Hostinger to Cloudflare.
- Cloudflare caching and analytics setup completed.

2. Added Atlas-only backup script:
- `sanghathi-Frontend/scripts/backup-db-atlas.sh`
- Exports backup files from Atlas/source DB without starting local Mongo container.

3. Updated scripts documentation:
- `sanghathi-Frontend/scripts/README.md`
- Added Atlas backup section and usage examples.

4. Verified existing backup artifact status:
- Backup directory exists: `database-backups/`
- Latest artifact:
  - `database-backups/cmrit-2026-04-13T18-30-03-439Z`
- Latest summary indicates:
  - source DB: `cmrit`
  - exported collections: `42`

## File Change Statistics

- Files added: 2
- Files updated: 2
- Files removed: 0
- Total touched: 4

## Files Changed

- `sanghathi-Frontend/scripts/backup-db-atlas.sh`
- `sanghathi-Frontend/scripts/README.md`
- `sanghathi-Frontend/docs/kethan/2026-04-18-014-cloudflare-atlas-backup-runbook.md`
- `sanghathi-Frontend/docs/kethan/README.md`

## Verification and Test Results

- `backup-db-atlas.sh` syntax check: passed.
- `backup-db-atlas.sh --help` output: passed and shows forwarded backup options.
- Backup artifact check: latest `schema-summary.json` readable and valid.

## Risks or Follow-up Items

- Cloudflare DNS/analytics update is recorded as owner-reported change; operational validation should still be checked in Cloudflare dashboard.
- Add scheduled Atlas export automation (cron/GitHub Actions) and retention cleanup.
- Add periodic restore drill to verify backup usability, not just backup existence.

## Quick Commands

### Run frontend and backend

- Start both:
  - `./sanghathi-Frontend/scripts/start-servers.sh`
- Start backend only:
  - `./sanghathi-Frontend/scripts/start-servers.sh --backend`
- Start frontend only:
  - `./sanghathi-Frontend/scripts/start-servers.sh --frontend`

### Run all tests

- `./sanghathi-Frontend/scripts/run-all-tests.sh`

### Atlas backup (no local Mongo container)

- `./sanghathi-Frontend/scripts/backup-db-atlas.sh`
- With explicit URI:
  - `./sanghathi-Frontend/scripts/backup-db-atlas.sh --source-uri "mongodb+srv://..."`

### Verify Atlas backup artifacts locally

- List latest backup folder:
  - `ls -1dt database-backups/* | head -n 1`
- Inspect summary file:
  - `cat database-backups/<latest>/schema-summary.json`

### Atlas-native backup checks (dashboard)

1. Atlas -> Cluster -> Backups -> verify latest snapshot timestamp.
2. Confirm retention policy (daily/weekly/monthly) meets RPO.
3. Perform test restore to a temp cluster and verify key collections/doc counts.
