# 2026-04-19-043 Upload History Visibility and Admin Data Guidance Upgrade

## 1. Update Summary
Upgraded admin upload observability and bulk-upload UX. Local script ingests now create `AdminUploadSession` entries (so they are visible in `/admin/upload-history`), upload history UI now shows detailed ingest information, admin sidebar now includes `Add Data`, and `/admin/data` now provides clearer tab-specific bulk-upload guidance.

## 2. What Was Wrong
- `/admin/upload-history` only showed sessions created from dashboard uploads; script-based ingests were invisible.
- Upload History table had limited detail and did not expose source/uploader/metadata clearly.
- Admin sidebar lacked a direct `Add Data` entry.
- `/admin/data` instructions were too generic for safe bulk operations.

## 3. What Was Fixed
- Backend upload session model/controller:
  - Added session `source` (`dashboard-ui`, `local-script`, `api`).
  - Allowed system/script sessions without strict `adminUserId` requirement.
  - Added source filtering and user population (`adminUserId`, `restoredBy`) in history listing.
- Local ingest script (`ingest-iat-local.mjs`):
  - On apply mode, now writes a `local-script` upload session to `adminuploadsessions` with:
    - file name
    - status
    - row/success/error counts
    - affected user IDs
    - unmatched USNs
    - action counts
    - report/manifest paths
- Upload History page enhancements:
  - Added summary cards (sessions/success/partial/failed/restored).
  - Added filters (source/status/tab).
  - Added columns for source, uploader, affected/created counts.
  - Added details dialog showing full metadata, errors, and restore summary.
- Admin navigation:
  - Added sidebar item: `Add Data` -> `/admin/data`.
- Admin Data UX and guidance:
  - Added detailed bulk upload checklist.
  - Added tab-specific required columns and operational notes.
  - Added IAT-specific note for wide-format sheet ingestion via local script.
- Add IAT instructions:
  - Made accepted formats/values clearer (numeric + AB/NE/ABSENT, row-wise expectation).

## 4. File Change Statistics
- Backend source/docs files changed: 4
- Frontend source files changed: 5
- Frontend docs changed: 2
- Runtime ingest artifacts generated: 2
- Total files changed in this update: 13

## 5. Files Changed
### Backend
- sanghathi-Backend/src/models/AdminUploadSession.js
- sanghathi-Backend/src/controllers/Admin/uploadHistoryController.js
- sanghathi-Backend/scripts/ingest-iat-local.mjs
- sanghathi-Backend/scripts/README.md

### Frontend
- sanghathi-Frontend/src/utils/uploadHistory.js
- sanghathi-Frontend/src/pages/Admin/UploadHistory.jsx
- sanghathi-Frontend/src/pages/Admin/Data.jsx
- sanghathi-Frontend/src/layouts/sidebar/NavConfig.jsx
- sanghathi-Frontend/src/pages/Admin/AddIat.jsx

### Runtime Artifacts
- sanghathi-Backend/logs/iat-ingest/iat-ingest-manifest-2026-04-19T03-12-10-253Z.json
- sanghathi-Backend/logs/iat-ingest/iat-ingest-report-2026-04-19T03-12-10-253Z.json

### Documentation
- sanghathi-Frontend/docs/kethan/2026-04-19-043-upload-history-visibility-and-admin-data-guidance-upgrade.md
- sanghathi-Frontend/docs/kethan/README.md

## 6. Verification and Test Results
- Edited files diagnostics: no errors.
- Re-ran ingest apply after script update; result:
  - planned writes: 216
  - applied writes: 216
  - failed writes: 0
  - upload session id generated successfully.
- Direct DB verification confirmed session now exists in `adminuploadsessions` with source `local-script` and full metadata fields.

## 7. Risks or Follow-up Items
- Existing historical script ingests done before this change are not auto-backfilled into upload history unless re-run or manually imported.
- Current upload history API paging limit is 100 per request; add server-side paging controls in UI for very large histories.
- Consider adding direct links/download actions for report/manifest files from UI when exposed through a secure backend endpoint.

## Further Improvements
- Add per-session “Re-run with same file” helper for script ingests.
- Add CSV schema validator preview before upload in each admin tab.
- Add unified ingest history for Attendance/External/TYL script flows using the same session format.
