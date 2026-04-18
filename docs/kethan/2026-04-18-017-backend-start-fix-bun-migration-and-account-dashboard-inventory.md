# Sanghathi - Backend Start Fix, Bun Migration, and Account Dashboard Inventory

Date: 2026-04-18
Report ID: 017
Type: Runtime fix + package manager migration + documentation
Status: Completed

## Update Summary

Fixed backend startup crash, migrated operational scripts from npm to Bun, updated deployment config for Fly.io/Netlify Bun builds, and added a root-level account/dashboard inventory README.

## What Was Wrong

- Backend startup crashed with:
  - `TypeError: Cannot read properties of undefined (reading 'replace')`
  - Root cause: `MONGODB_URI` was missing while `src/utils/db.js` did a top-level `.replace()`.
- Script runner and docs were still npm-based while Bun migration was requested.
- Deployment config still referenced Node/Yarn (Fly Dockerfile) and npm build command (Netlify).
- No single root-level document existed with role login inventory + dashboard map.

## What Was Fixed

1. Backend startup reliability fix:
- Updated `sanghathi-Backend/src/config.js` to load env files in priority order:
  - environment-specific file (`.env.development` or `.env.production`)
  - `.env.local`
  - `.env`
- Updated `sanghathi-Backend/src/utils/db.js`:
  - Added `resolveMongoUri()` with explicit validation.
  - Supports `MONGODB_URI`, `MONGO_URI`, and `DATABASE_URL`.
  - Handles `<PASSWORD>` placeholder only when present.
  - Throws clear errors instead of crashing with undefined `.replace()`.

2. Bun migration for scripts:
- Updated root scripts:
  - `scripts/start-servers.sh`
  - `scripts/run-all-tests.sh`
- Updated frontend mirror scripts:
  - `sanghathi-Frontend/scripts/start-servers.sh`
  - `sanghathi-Frontend/scripts/run-all-tests.sh`
- Replaced npm invocations with Bun (`bun run ...`).
- Added Bun presence checks in scripts.

3. Deployment migration updates:
- Updated `sanghathi-Backend/Dockerfile` for Bun-based build/runtime.
- Updated `sanghathi-Frontend/netlify.toml`:
  - build command -> `bun run build`
  - build environment -> `BUN_VERSION=1.3.10`

4. Account/dashboard root documentation:
- Added root file:
  - `README-LOGINS-DASHBOARDS.md`
- Included:
  - role-wise login inventory template
  - full dashboard route map
  - role module map
  - password reset and Atlas safety checklist

## File Change Statistics

- Files added: 2
- Files updated: 11
- Files removed: 0
- Total touched: 13

## Files Changed

- `sanghathi-Backend/src/config.js`
- `sanghathi-Backend/src/utils/db.js`
- `sanghathi-Backend/package.json`
- `sanghathi-Backend/Dockerfile`
- `scripts/start-servers.sh`
- `scripts/run-all-tests.sh`
- `scripts/README.md`
- `sanghathi-Frontend/scripts/start-servers.sh`
- `sanghathi-Frontend/scripts/run-all-tests.sh`
- `sanghathi-Frontend/package.json`
- `sanghathi-Frontend/netlify.toml`
- `README-LOGINS-DASHBOARDS.md`
- `sanghathi-Frontend/docs/kethan/2026-04-18-017-backend-start-fix-bun-migration-and-account-dashboard-inventory.md`

## Verification and Test Results

- Bun availability:
  - `bun --version` -> `1.3.10`

- Root script help checks:
  - `./scripts/start-servers.sh --help` -> Bun commands shown
  - `./scripts/run-all-tests.sh --help` -> passed
  - `./scripts/backup-db-atlas.sh --help` -> passed

- Backend startup check:
  - Initial crash fixed (`undefined.replace` no longer occurs).
  - Backend reached running state and DB connected:
    - `App running on port 8000`
    - `DB CONNECTED SUCCESSFULLY!`

- Additional runtime note observed during validation:
  - Port conflict (`EADDRINUSE`) can still happen if another process is already bound to the configured backend port.

## Risks or Follow-up Items

- Root account inventory file is intentionally template-based for passwords because plaintext passwords are not recoverable from DB hashes.
- If migrating entirely to Bun installs, generate and maintain Bun lockfiles during the next dependency sync.
- Ensure production CI/CD environments have Bun available.

## Active Commands (Workspace Root)

- Start backend + frontend:
  - `./scripts/start-servers.sh`
- Start backend only:
  - `./scripts/start-servers.sh --backend`
- Run all tests:
  - `./scripts/run-all-tests.sh`
- Atlas backup export:
  - `./scripts/backup-db-atlas.sh`
