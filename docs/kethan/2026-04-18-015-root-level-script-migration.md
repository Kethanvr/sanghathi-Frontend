# Sanghathi - Root-Level Script Migration

Date: 2026-04-18
Report ID: 015
Type: Dev workflow + script path standardization
Status: Completed

> Note: Current active workflow has moved to Atlas-only backup.
> See report `016` for latest command set:
> `2026-04-18-016-atlas-only-backup-and-tsconfig-fix.md`

## Update Summary

Created a new workspace-root `scripts/` folder and migrated operational script entrypoints so commands now run from project root without cross-repo path confusion.

## What Was Wrong

- Operational scripts were located under `sanghathi-Frontend/scripts/`, which caused confusion when running commands from workspace root.
- Existing usage examples included longer nested paths and increased the chance of command mistakes.
- The user explicitly requested root-level scripts outside both repo folders.

## What Was Fixed

1. Added root-level scripts in `./scripts/`:
- `scripts/start-servers.sh`
- `scripts/run-all-tests.sh`
- `scripts/start-local-mongo.sh`
- `scripts/backup-db-local.sh`
- `scripts/backup-db-atlas.sh`
- `scripts/README.md`

2. Updated script path logic for root execution:
- All new scripts resolve workspace root correctly using:
  - `ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"`

3. Set execute permission on root scripts:
- `chmod +x scripts/*.sh`

4. Updated old frontend script documentation to avoid drift:
- `sanghathi-Frontend/scripts/README.md` now points users to canonical root scripts doc (`./scripts/README.md`).

## File Change Statistics

- Files added: 7
- Files updated: 2
- Files removed: 0
- Total touched: 9

## Files Changed

- `scripts/start-servers.sh`
- `scripts/run-all-tests.sh`
- `scripts/start-local-mongo.sh`
- `scripts/backup-db-local.sh`
- `scripts/backup-db-atlas.sh`
- `scripts/README.md`
- `sanghathi-Frontend/scripts/README.md`
- `sanghathi-Frontend/docs/kethan/2026-04-18-015-root-level-script-migration.md`
- `sanghathi-Frontend/docs/kethan/README.md`

## Verification and Test Results

Validated from workspace root:

- `./scripts/start-servers.sh --help` -> passed
- `./scripts/run-all-tests.sh --help` -> passed
- `./scripts/start-local-mongo.sh --help` -> passed
- `./scripts/backup-db-atlas.sh --help` -> passed (and forwarded backup options displayed)
- `./scripts/backup-db-local.sh --no-local-sync --help` -> passed (forwarded backup options displayed)

## Risks or Follow-up Items

- Old executable scripts still exist under `sanghathi-Frontend/scripts/`; consider removing or replacing them with thin wrappers if you want a single enforced entrypoint.
- Optional: add root-level npm scripts in a top-level package to proxy these shell scripts for even easier onboarding.

## Quick Commands (Workspace Root)

- Start backend + frontend:
  - `./scripts/start-servers.sh`
- Run all tests:
  - `./scripts/run-all-tests.sh`
- Start local Mongo:
  - `./scripts/start-local-mongo.sh`
- Backup with local sync:
  - `./scripts/backup-db-local.sh`
- Atlas/source backup only:
  - `./scripts/backup-db-atlas.sh`
