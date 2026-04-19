# Sanghathi - Atlas-Only Backup and TypeScript Error Fix

Date: 2026-04-18
Report ID: 016
Type: Backup workflow simplification + build error fix
Status: Completed

## Update Summary

Removed local MongoDB backup/sync workflow and switched to Atlas-only backup exports. Fixed backend TypeScript config error caused by script files being included outside `rootDir`.

## What Was Wrong

- Backup tooling still contained local MongoDB container/sync flow, but the project is now Atlas-only.
- Duplicate local backup helper scripts increased command confusion.
- Backend TypeScript problems panel showed:
  - `Cannot write file ... scripts/local-db-backup.mjs because it would overwrite input file`
  - `File ... scripts/local-db-backup.mjs is not under rootDir .../src`

## What Was Fixed

1. Replaced local backup engine with Atlas-only engine:
- Added `sanghathi-Backend/scripts/atlas-db-backup.mjs`
- Removed `sanghathi-Backend/scripts/local-db-backup.mjs`

2. Updated wrappers to Atlas-only:
- Updated `scripts/backup-db-atlas.sh` -> now forwards to `atlas-db-backup.mjs`
- Updated `sanghathi-Frontend/scripts/backup-db-atlas.sh` -> now forwards to `atlas-db-backup.mjs`

3. Removed local-Mongo helper scripts:
- Removed `scripts/start-local-mongo.sh`
- Removed `scripts/backup-db-local.sh`
- Removed `sanghathi-Frontend/scripts/start-local-mongo.sh`
- Removed `sanghathi-Frontend/scripts/backup-db-local.sh`

4. Fixed TypeScript config error:
- Updated `sanghathi-Backend/tsconfig.json`
- Added `scripts` to `exclude` array so script files outside `src` are not compiled by tsserver/tsc.

5. Updated script docs:
- Updated `scripts/README.md` to Atlas-only backup guidance.
- Updated `sanghathi-Frontend/scripts/README.md` quick commands to Atlas-only backup.

## File Change Statistics

- Files added: 2
- Files updated: 7
- Files removed: 5
- Total touched: 14

## Files Changed

- `sanghathi-Backend/scripts/atlas-db-backup.mjs`
- `sanghathi-Backend/tsconfig.json`
- `scripts/backup-db-atlas.sh`
- `scripts/README.md`
- `sanghathi-Frontend/scripts/backup-db-atlas.sh`
- `sanghathi-Frontend/scripts/README.md`
- `scripts/start-local-mongo.sh` (removed)
- `scripts/backup-db-local.sh` (removed)
- `sanghathi-Frontend/scripts/start-local-mongo.sh` (removed)
- `sanghathi-Frontend/scripts/backup-db-local.sh` (removed)
- `sanghathi-Backend/scripts/local-db-backup.mjs` (removed)
- `sanghathi-Frontend/docs/kethan/2026-04-18-016-atlas-only-backup-and-tsconfig-fix.md`
- `sanghathi-Frontend/docs/kethan/2026-04-18-015-root-level-script-migration.md`
- `sanghathi-Frontend/docs/kethan/README.md`

## Verification and Test Results

- `./scripts/backup-db-atlas.sh --help` -> passed
- Root script inventory verified:
  - `scripts/` now contains only:
    - `start-servers.sh`
    - `run-all-tests.sh`
    - `backup-db-atlas.sh`
    - `README.md`
- Backend script inventory verified:
  - `sanghathi-Backend/scripts/atlas-db-backup.mjs` present
  - `sanghathi-Backend/scripts/local-db-backup.mjs` removed
- TypeScript diagnostics check:
  - `sanghathi-Backend/tsconfig.json` -> no errors

## Risks or Follow-up Items

- Historical log files (older mentor reports) still mention local Mongo backup flow; this is expected for audit history but no longer reflects the current active workflow.
- Atlas free tier does not provide full backup features like paid dedicated tiers; maintain regular export schedule and restore drills.

## Active Commands (Workspace Root)

- Start backend + frontend:
  - `./scripts/start-servers.sh`
- Run all tests:
  - `./scripts/run-all-tests.sh`
- Atlas/source backup export:
  - `./scripts/backup-db-atlas.sh`
