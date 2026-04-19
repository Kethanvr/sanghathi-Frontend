# 2026-04-19-041 Local IAT Ingest and Rollback Scripts

## 1. Update Summary
Implemented backend script-based ingestion for local IAT files (CSV/XLSX) with a safe dry-run first workflow, explicit apply mode, and rollback support using generated manifests. This is focused on IAT import for 6th semester first.

## 2. What Was Wrong
- Existing admin UI upload expects a specific row-wise CSV structure and was not ideal for wide-format local Excel files.
- There was no standardized local-file ingestion pipeline in backend scripts for IAT.
- There was no dedicated rollback script for local IAT ingestion runs.

## 3. What Was Fixed
- Added `scripts/ingest-iat-local.mjs` with:
  - CSV/XLSX input support (`xlsx` package)
  - header auto-detection and subject block parsing
  - semester filter (default set to 6)
  - USN to userId mapping via `studentprofiles`
  - dry-run by default and apply only with `--apply`
  - action planning (`insert-user-doc`, `append-semester`, `replace-semester`)
  - JSON reports under `logs/iat-ingest/`
  - rollback manifest generation in apply mode
- Added `scripts/rollback-iat-local.mjs` with:
  - manifest-driven rollback (dry-run by default)
  - apply mode with restoration/deletion as needed
  - JSON rollback report under `logs/iat-ingest/`
- Added package scripts:
  - `db:ingest-iat-local`
  - `db:rollback-iat-local`
- Updated scripts documentation with exact run commands and flags.

## 4. File Change Statistics
- Backend files changed: 5
- Frontend docs changed: 2
- Total files changed in this update: 7

## 5. Files Changed
### Backend
- sanghathi-Backend/scripts/ingest-iat-local.mjs
- sanghathi-Backend/scripts/rollback-iat-local.mjs
- sanghathi-Backend/scripts/README.md
- sanghathi-Backend/package.json
- sanghathi-Backend/bun.lock

### Documentation
- sanghathi-Frontend/docs/kethan/2026-04-19-041-local-iat-ingest-and-rollback-scripts.md
- sanghathi-Frontend/docs/kethan/README.md

## 6. Verification and Test Results
- Installed dependency successfully: `xlsx` in backend.
- Syntax validation passed:
  - `node --check scripts/ingest-iat-local.mjs`
  - `node --check scripts/rollback-iat-local.mjs`
- No runtime ingest execution was performed yet in this step (implementation + validation only).

## 7. Risks or Follow-up Items
- Run dry-run against the actual 6th sem workbook first and review `unmatched` USNs/errors in report.
- If sheet header variants differ, add more header aliases in ingest parser before apply.
- After one successful cycle, extend the same script framework for Attendance/External/TYL with shared parser utilities.

## Further Improvements
- Add optional `--usn-prefix`/normalization rules for institutional USN formatting differences.
- Add duplicate-subject conflict reporting per USN in dry-run output.
- Add integration test fixtures for both row-wise and wide-format IAT sample files.
