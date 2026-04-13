# Sanghathi - Database Backup and Backend Query Optimization

Date: 2026-04-13
Report ID: 011
Type: Infrastructure + performance update
Status: Completed

## Update Summary

Implemented local MongoDB backup workflow, generated database structure summary, and optimized backend DB schemas/query calls for better read performance.

## What Was Wrong

- No built-in script flow existed to create a local Mongo backup DB from current production/source data.
- No automatic schema structure artifact existed for quick collection/field/index review.
- Several backend endpoints fetched large payloads without pagination or lean reads.
- Core collections lacked indexes for common query patterns.
- Mentor allocation routes had excessive per-record logging and unoptimized projections.

## What Was Fixed

1. Local DB backup + structure workflow
- Added backend backup engine script:
  - `sanghathi-Backend/scripts/local-db-backup.mjs`
- Added frontend script entrypoints (as requested script location):
  - `sanghathi-Frontend/scripts/start-local-mongo.sh`
  - `sanghathi-Frontend/scripts/backup-db-local.sh`
- Added script docs and usage:
  - `sanghathi-Frontend/scripts/README.md`

2. Created local Mongo database for backup
- Started local Docker MongoDB (`mongo:7`) on `mongodb://127.0.0.1:27018`.
- Synced source DB backup into local DB `cmrit_backup`.
- Verified local DB presence and data:
  - databases include `cmrit_backup`
  - `collections=37`
  - sample counts: `users=722`, `threads=1744`

3. Generated structure artifacts
- Backup output folder created:
  - `database-backups/cmrit-2026-04-13T18-30-03-439Z`
- Includes:
  - per-collection `.jsonl` export files
  - `schema-summary.json` (collection counts, indexes, inferred schema fields/types)
- Export summary recorded `42` source collections in this run.

4. Backend query/index optimization
- Added indexes in models:
  - `User`: role/status and lastActivity
  - `Thread`: participants, author, status+createdAt, topic+status+createdAt
  - `Notification`: user/time and user/unread/time
  - `Mentorship`: mentorId, menteeId, mentorId+menteeId
  - `PrivateConversation`: participants+createdAt
  - `Message`: senderId+createdAt
  - `StudentProfile`: userId, usn
- Optimized endpoint query behavior:
  - added pagination (`page`, `limit`) and sorting in thread/conversation/notification reads
  - added `lean()` and selective field projection in user and mentor-heavy paths
  - reduced high-volume debug logging in mentor routes

## File Change Statistics

- Files added: 3
- Files updated: 13
- Files removed: 2 (duplicate root-level script copies)
- Total touched: 17

## Files Changed

Added:
- `sanghathi-Backend/scripts/local-db-backup.mjs`
- `sanghathi-Frontend/scripts/backup-db-local.sh`
- `sanghathi-Frontend/scripts/start-local-mongo.sh`

Updated:
- `sanghathi-Backend/src/models/User.js`
- `sanghathi-Backend/src/models/Thread.js`
- `sanghathi-Backend/src/models/Notification.js`
- `sanghathi-Backend/src/models/Mentorship.js`
- `sanghathi-Backend/src/models/Conversation/PrivateConversation.js`
- `sanghathi-Backend/src/models/Conversation/Message.js`
- `sanghathi-Backend/src/models/Student/Profile.js`
- `sanghathi-Backend/src/controllers/threadController.js`
- `sanghathi-Backend/src/controllers/notificationController.js`
- `sanghathi-Backend/src/controllers/Conversation/privateConversationController.js`
- `sanghathi-Backend/src/controllers/userController.js`
- `sanghathi-Backend/src/routes/Student/mentorRoutes.js`
- `sanghathi-Frontend/scripts/run-all-tests.sh`
- `sanghathi-Frontend/scripts/start-servers.sh`
- `sanghathi-Frontend/scripts/README.md`

Removed (duplicate script location copies):
- `scripts/backup-db-local.sh`
- `scripts/start-local-mongo.sh`

## Verification and Test Results

- Local MongoDB started and validated via container status.
- Local backup sync completed successfully.
- Schema summary file generated successfully.
- Unified tests passed after optimization changes:
  - Backend: `5/5` suites, `25/25` tests
  - Frontend: `3/3` files, `9/9` tests
- Script syntax and diagnostics checks: clean.

## Risks or Follow-up Items

- New indexes are defined in schemas; ensure index creation is applied in deployed environments (`syncIndexes`/migration strategy as needed).
- Backup export files can be large; avoid committing `database-backups/` to git.
- Add scheduled backup automation (daily/weekly) and retention cleanup policy.
- Consider adding route-level limits/defaults consistently in all heavy list endpoints.
