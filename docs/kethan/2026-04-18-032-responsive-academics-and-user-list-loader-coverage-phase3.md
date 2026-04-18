# 2026-04-18-032 Responsive Academics and User List Loader Coverage (Phase 3)

## 1. Update Summary
Continued the global loader and full responsiveness plan with a focused Phase 3 batch on student academic views and admin user management. Migrated remaining raw Axios calls in this scope to the shared API client, added mobile-safe layouts for attendance and scorecard reports, and improved User List table/filter behavior on smaller screens.

## 2. What Was Wrong
- Attendance, IAT, and External pages still used raw Axios calls with duplicated auth header handling, reducing consistency with global loader behavior.
- Student report pages had desktop-first table/control layouts that were difficult to use on mobile.
- User List filters and header actions were crowded on small screens.
- User List select-all behavior was not scoped to filtered results, which could cause confusing bulk selection behavior.
- Search matching in User List did not guard against missing name/email values.

## 3. What Was Fixed
- Loader coverage and API consistency:
  - Migrated API calls in attendance and scorecard views to the shared API client.
  - Migrated the shared student semester hook to the shared API client, improving loader coverage for all pages using this hook.
- Attendance page improvements:
  - Added responsive container and stacked semester/month filters for xs screens.
  - Added loading/error states and empty-state messaging.
  - Added horizontal overflow-safe table wrapper with mobile min-width.
- IAT page improvements:
  - Added responsive container and semester filter layout.
  - Added loading/error states and empty-state row.
  - Added overflow-safe table wrapper and hid lower-priority column(s) on xs.
- External page improvements:
  - Added responsive container and semester filter layout.
  - Added loading/error states and overflow-safe table wrapper.
  - Hid lower-priority columns on smaller breakpoints to reduce visual crowding.
- User List improvements:
  - Made header action area and filter/search controls responsive for xs/sm.
  - Added horizontal scroll-safe table behavior with mobile min-width.
  - Hid lower-priority columns on smaller breakpoints.
  - Fixed select-all logic to target filtered rows and preserve non-filtered selections.
  - Added null-safe search matching for name/email fields.

## 4. File Change Statistics
- Frontend source files changed: 5
- Docs files changed: 2
- Total files changed: 7

## 5. Files Changed
### Frontend
- sanghathi-Frontend/src/hooks/useStudentSemester.js
- sanghathi-Frontend/src/pages/Student/Attendance.jsx
- sanghathi-Frontend/src/pages/Scorecard/Iat.jsx
- sanghathi-Frontend/src/pages/Scorecard/External.jsx
- sanghathi-Frontend/src/pages/Users/UserList.jsx

### Documentation
- sanghathi-Frontend/docs/kethan/2026-04-18-032-responsive-academics-and-user-list-loader-coverage-phase3.md
- sanghathi-Frontend/docs/kethan/README.md

## 6. Verification and Test Results
- Diagnostics on all changed files: no errors
- Frontend production build: passed (`vite build`)
- Existing note: large bundle/chunk warnings remain and are unchanged from prior builds

## 7. Risks or Follow-up Items
- Additional score/admin data-entry pages still use raw Axios patterns and should be migrated to shared API client for complete loader coverage.
- Some table-heavy pages still rely on horizontal scroll at xs; where mobile usage is high, selective card/list row transformation can further improve readability.
- Chunk-size warnings remain and should be handled in a dedicated performance pass (route-level code splitting/manual chunks).