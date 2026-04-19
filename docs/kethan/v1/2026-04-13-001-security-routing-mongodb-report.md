# Update Report: Security, Routing, MongoDB Validation, and Quality Improvements

Date: 2026-04-13
Update ID: 001
Scope: Backend + Frontend

## 1. Update Summary

This update hardened backend security, standardized request validation, improved middleware ordering, normalized frontend routes, enabled real code splitting, fixed API URL consistency, improved chatbot behavior, added tests, and verified the active MongoDB database configuration.

## 2. What Was Wrong

### Backend issues

- Several important APIs were exposed without authentication/role checks.
- Test/debug endpoints were available in normal runtime.
- Swagger and catch-all route ordering was fragile and duplicated across bootstrap files.
- Thread route registration had duplication.
- Request validation was inconsistent across write endpoints.
- RAG service depended on MONGODB_URI2 only, with no fallback if unreachable.
- Runtime logging was too noisy for production.

### Frontend issues

- Mixed-case route paths caused routing inconsistency.
- Route components were eagerly imported, so true route-level splitting was not active.
- Vite output options were forcing single-bundle-like behavior.
- RAG frontend call used hardcoded localhost URL.
- Chatbot used hardcoded static institutional answers and rigid fixed-position layout.
- Excessive debug logs in runtime code.

### Data/config issue

- Needed to verify which MongoDB URI is actually serving app data.

## 3. What Was Fixed

### Backend hardening and architecture

- Added auth and role-based authorization to key previously open routes.
- Added reusable request validation middleware and applied schemas to critical write APIs.
- Gated test/debug routes to non-production only.
- Moved Swagger registration into app bootstrap before catch-all routing.
- Removed duplicate late-stage Swagger and duplicate 404 behavior from server bootstrap.
- Removed duplicate thread route declaration.
- Added production console suppression for log/info/debug to reduce noisy logs.
- Updated backend Node engine requirement to modern runtime baseline.

### Frontend reliability and architecture

- Converted route components to lazy imports for true route-level code splitting.
- Normalized major mixed-case routes to lowercase canonical paths and added redirect compatibility.
- Updated all affected dashboard/popover links to canonical paths.
- Fixed RAG API call to use configured base URL.
- Improved axios interceptor behavior to retain real error object and keep verbose diagnostics only in dev.
- Reworked chatbot to use RAG-based answers for option flows and improved responsive embedded layout behavior.

### MongoDB validation and resilience

- Verified active app DB is from MONGODB_URI and default DB is cmrit.
- Verified MONGODB_URI2 is currently unreachable from this environment due DNS resolution failure.
- Updated RAG DB client logic to try MONGODB_URI2 first and automatically fallback to MONGODB_URI.
- Added optional env support for RAG DB/collection names.

## 4. File Change Statistics

- Total files changed: 30
- Backend files changed: 14
- Frontend files changed: 16
- New files added: 4
- Lockfiles updated by environment/tooling: 2

## 5. Files Changed

### Backend (14)

- package.json
- src/index.js
- src/rag.js
- src/server.js
- src/swagger.js
- src/routes/userRoutes.js
- src/routes/attendanceRoutes.js
- src/routes/meetingRoutes.js
- src/routes/threadRoutes.js
- src/routes/conversationRoutes.js
- src/routes/Student/studentRoutes.js
- src/middlewares/validateRequest.js (new)
- src/tests/validateRequest.test.js (new)
- yarn.lock

### Frontend (16)

- src/App.jsx
- src/apiCalls.js
- src/mychatbot.jsx
- src/utils/axios.js
- src/layouts/header/AccountPopover.jsx
- src/layouts/sidebar/NavConfig.jsx
- src/pages/Dashboard.jsx
- src/pages/Faculty/StudentDashboard.jsx
- src/pages/Admin/AdminDashboard.jsx
- src/pages/Hod/HodDashboard.jsx
- src/pages/Director/DirectorDashboard.jsx
- src/pages/Faculty/FacultyDashboard.jsx
- vite.config.js
- src/context/AuthReducer.test.js (new)
- src/apiCalls.test.js (new)
- package-lock.json

## 6. Verification and Test Results

### Database verification

- MONGODB_URI: connected successfully.
- Default DB: cmrit.
- cmrit collections found include users, roles, studentprofiles, attendances, threads, conversations, meetings, notifications, placements, poattainments, tylscores, and others.
- MONGODB_URI2: connection failed with DNS resolution error for aiquery cluster.

### Automated tests

- Backend test run:
  - validateRequest.test.js
  - Result: PASS (2 tests, 1 suite)

- Frontend test run:
  - AuthReducer.test.js
  - apiCalls.test.js
  - Result: PASS (5 tests, 2 files)

### Diagnostics

- Post-change diagnostics check returned no errors in edited files.

## 7. Risks or Follow-up Items

- Secrets are present in local environment files and should be rotated for safety before wider sharing/deployment.
- Lockfile changes should be reviewed and either committed intentionally or reverted as per team policy.
- RAG fallback now works with app DB URI, but best practice is to restore/fix dedicated MONGODB_URI2 connectivity for separation of concerns.

## Mentor-ready outcome statement

This update significantly improved project security posture, runtime stability, maintainability, and verification quality across both backend and frontend, with measurable coverage additions and validated database behavior.
