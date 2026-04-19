# 1. Update Summary

Implemented the pending backend migration items from report 023:
- Completed full message runtime cutover to parent-owned reads/writes.
- Removed legacy message-array fallback and dual-write branches.
- Enforced strict one-to-one unique `userId` indexes across target collections.
- Updated index tooling compatibility so P0 checks treat unique indexes as valid for non-unique read-path specs.
- Re-ran database verification and backend tests.

# 2. What Was Wrong

1. Message runtime still carried transitional fallback logic (`populate("messages")`) and dual-write behavior (`$push` into parent `messages[]` arrays).
2. One-to-one collection safety was only partially enforced (some collections still had non-unique `userId` indexes).
3. `apply-p0-indexes` strict unique comparison could incorrectly mark non-unique specs as missing after unique upgrades.
4. Migration feature-flag config remained after the cutover target was reached.

# 3. What Was Fixed

1. Conversation message runtime cleanup:
- Removed feature-flag-gated fallback and dual-write code paths.
- `messageContoller` now reads messages only by `parentType + parentId`.
- `messageContoller` no longer pushes message ids into conversation arrays.

2. Thread message runtime cleanup:
- `threadController.getThreadById` now always resolves timeline via `messages` collection parent query.
- `threadController.sendMessageToThread` no longer writes into `thread.messages[]`.
- `threadService.getThreadMessages` now always reads via parent ownership query.

3. Strict one-to-one unique index enforcement:
- Added new script: `scripts/enforce-one-to-one-unique-indexes.mjs`.
- Added npm command: `db:enforce-one-to-one-unique-indexes`.
- Apply run on `cmrit`:
  - created unique indexes: 2
  - upgraded non-unique to unique: 5
  - dropped conflicting non-unique indexes: 5
  - errors: 0
- Post-apply dry-run confirms all 20 target collections are already unique.

4. Tooling compatibility patch:
- Updated `scripts/apply-p0-indexes.mjs` equivalence logic so unique indexes satisfy non-unique P0 specs.
- Post-patch P0 verification dry-run reports 0 planned, 0 errors.

5. Cleanup:
- Removed obsolete `src/config/featureFlags.js` after full cutover.

# 4. File Change Statistics

Backend repository changes in this update:
- Tracked files modified/deleted: 7
- Tracked diff: 57 insertions, 126 deletions
- New backend file added: 1

Frontend docs:
- New report file added: 1
- Kethan report index updated: 1

Database verification outcomes:
- One-to-one unique apply: created 2, upgraded 5, dropped 5, errors 0
- One-to-one unique post-check: 20/20 already unique
- P0 index verification post-hardening: planned 0, errors 0
- Message parent backfill verification: planned updates 0

Testing:
- Backend Jest suites: 5 passed
- Backend tests: 25 passed

# 5. Files Changed

## Backend code/scripts
- `sanghathi-Backend/src/controllers/Conversation/messageContoller.js`
- `sanghathi-Backend/src/controllers/threadController.js`
- `sanghathi-Backend/src/services/threadService.js`
- `sanghathi-Backend/src/config/featureFlags.js` (removed)
- `sanghathi-Backend/scripts/enforce-one-to-one-unique-indexes.mjs` (new)
- `sanghathi-Backend/scripts/apply-p0-indexes.mjs`
- `sanghathi-Backend/scripts/README.md`
- `sanghathi-Backend/package.json`

## Generated migration logs
- `sanghathi-Backend/logs/one-to-one-unique-index-enforcement-2026-04-18T09-47-54-128Z.json`
- `sanghathi-Backend/logs/one-to-one-unique-index-enforcement-2026-04-18T09-48-02-325Z.json`
- `sanghathi-Backend/logs/one-to-one-unique-index-enforcement-2026-04-18T09-48-11-736Z.json`
- `sanghathi-Backend/logs/p0-index-enforcement-2026-04-18T09-48-46-214Z.json`
- `sanghathi-Backend/logs/message-parent-backfill-2026-04-18T09-48-53-730Z.json`

## Frontend docs
- `sanghathi-Frontend/docs/kethan/2026-04-18-024-message-cutover-and-one-to-one-unique-enforcement.md`
- `sanghathi-Frontend/docs/kethan/README.md`

# 6. Verification and Test Results

1. One-to-one unique enforcement dry-run:
- Command: `npm run db:enforce-one-to-one-unique-indexes -- --source-db cmrit`
- Result: planned create 2, planned upgrade 5, errors 0.

2. One-to-one unique enforcement apply:
- Command: `npm run db:enforce-one-to-one-unique-indexes -- --source-db cmrit --apply --allow-drop-non-unique`
- Result: created 2, upgraded 5, dropped 5, errors 0.

3. One-to-one unique post-apply verification:
- Command: `npm run db:enforce-one-to-one-unique-indexes -- --source-db cmrit`
- Result: already unique 20/20, planned 0, errors 0.

4. P0 index compatibility verification:
- Command: `npm run db:apply-p0-indexes -- --source-db cmrit`
- Result: planned 0, errors 0.

5. Message parent ownership verification:
- Command: `npm run db:backfill-message-parents -- --source-db cmrit`
- Result: missing parent candidates 0, planned updates 0.

6. Backend test verification:
- Command: `npm test -- --runInBand`
- Result: 5/5 suites passed, 25/25 tests passed.

# 7. Risks or Follow-up Items

1. Parent docs (`threads`, `privateconversations`, `groupconversations`) still retain legacy `messages[]` fields at schema level, but runtime no longer depends on them.
2. If desired, a later cleanup step can remove/deprecate those schema fields and optionally unset historical array data in DB.
3. Broader collection consolidation plans in `docs/database/` remain future-phase work and were not changed in this update.
