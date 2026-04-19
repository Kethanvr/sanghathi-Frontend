# 2026-04-19-040 Admin Upload History and Restore Workflow

## 1. Update Summary
Implemented a full admin bulk-upload history and restore workflow across backend and frontend. Added backend session tracking APIs, restore preview/execute actions, frontend Upload History page, admin route/sidebar integration, and per-tab upload session logging so each bulk upload is auditable and reversible.

## 2. What Was Wrong
- Admin bulk uploads had no unified session history for auditing what was uploaded and when.
- There was no safe, session-based restore path for wrong uploads.
- Existing rollback support was inconsistent, and TYL data lacked a dedicated delete endpoint for admin restore workflows.
- Admin UI had no central history dashboard for previewing impact before restore.

## 3. What Was Fixed
- Added `AdminUploadSession` persistence model with upload metadata, row counts, status, errors, affected IDs, and restore metadata.
- Added admin upload history backend APIs:
  - create/list/get upload sessions
  - restore preview
  - restore execute
- Mounted upload history routes under `/api/admin`.
- Added missing admin rollback endpoint for TYL (`DELETE /api/tyl-scores/:userId`).
- Added frontend upload history utility client functions.
- Added new admin page to list sessions, preview restore impact, and execute restore with confirmation.
- Added admin navigation entry and route for Upload History.
- Added quick shortcut button from Admin Data page to Upload History.
- Integrated upload session logging into all admin bulk upload tabs:
  - add users
  - attendance
  - IAT
  - external marks
  - TYL marks
  - MOOC details
  - mini project details

## 4. File Change Statistics
- Backend source files changed: 6
- Frontend source files changed: 12
- Documentation files changed: 2
- Total files changed in this update: 20

## 5. Files Changed
### Backend
- sanghathi-Backend/src/models/AdminUploadSession.js
- sanghathi-Backend/src/controllers/Admin/uploadHistoryController.js
- sanghathi-Backend/src/routes/Admin/uploadHistoryRoutes.js
- sanghathi-Backend/src/index.js
- sanghathi-Backend/src/controllers/TYLScoresController.js
- sanghathi-Backend/src/routes/tylScores.js

### Frontend
- sanghathi-Frontend/src/utils/uploadHistory.js
- sanghathi-Frontend/src/pages/Admin/UploadHistory.jsx
- sanghathi-Frontend/src/layouts/sidebar/NavConfig.jsx
- sanghathi-Frontend/src/App.jsx
- sanghathi-Frontend/src/pages/Admin/Data.jsx
- sanghathi-Frontend/src/pages/Admin/AddStudents.jsx
- sanghathi-Frontend/src/pages/Admin/AddAttendance.jsx
- sanghathi-Frontend/src/pages/Admin/AddIat.jsx
- sanghathi-Frontend/src/pages/Scorecard/AddMarks.jsx
- sanghathi-Frontend/src/pages/Admin/AddTylMarks.jsx
- sanghathi-Frontend/src/pages/Admin/AddMoocDetails.jsx
- sanghathi-Frontend/src/pages/Admin/AddMiniProjectDetails.jsx

### Documentation
- sanghathi-Frontend/docs/kethan/2026-04-19-040-admin-upload-history-restore-workflow.md
- sanghathi-Frontend/docs/kethan/README.md

## 6. Verification and Test Results
- Frontend production build completed successfully (`vite build`).
- Syntax checks completed successfully for new/updated backend upload-history and TYL rollback files (`node --check`).
- Backend start command succeeded through workspace script (`./scripts/start-servers.sh --backend`).
- VS Code diagnostics on modified files reported no errors in the checked set.

## 7. Risks or Follow-up Items
- Run one end-to-end restore drill on live dev data to validate preview numbers and restore delete behavior for each tab type.
- Add optional restore transaction/soft-delete strategy for stronger operational safety in high-risk environments.
- Split environment defaults more strictly so local UI testing cannot accidentally write to production-like Atlas targets.
