# Sanghathi - Phase 3 TODO/FIXME Debt Cleanup

Date: 2026-04-13
Report ID: 005
Phase: 3 (TODO/FIXME remediation)
Status: Completed

## Objective

Resolve remaining TODO/FIXME debt in source code by implementing actionable fixes and removing stale markers.

## Debt Cleanup Results

Before Phase 3:
- Backend TODO/FIXME markers: 3
- Frontend TODO/FIXME markers: 11
- Total markers: 14

After Phase 3:
- Backend TODO/FIXME markers: 0
- Frontend TODO/FIXME markers: 0
- Total markers: 0

## Implemented Fixes

1. Backend
- Removed stale TODO in thread closure flow where access is already controlled at route level.
- Upgraded attendance notification utility to environment-based mail configuration (`MAIL_USER`, `MAIL_PASS`, optional `MAIL_FROM`) and added safety guards for missing data.
- Enabled XSS sanitization middleware (`xss-clean`) in app bootstrap.

2. Frontend
- Fixed sidebar route-active logic for safer nested-route matching.
- Cleaned and improved thread page behavior:
  - removed artificial loading timeout,
  - scoped mentor/faculty user list to students,
  - fixed naming (`fetchUsers`),
  - used functional state updates for add/delete.
- Removed obsolete FIXME/TODO marker blocks from thread and report views.
- Removed stale App-level TODO marker.

## Files Updated

- `sanghathi-Backend/src/services/threadService.js`
- `sanghathi-Backend/src/routes/Student/sendEmail.js`
- `sanghathi-Backend/src/index.js`
- `sanghathi-Frontend/src/layouts/sidebar/NavigationItem/NavigationItem.jsx`
- `sanghathi-Frontend/src/pages/Thread/Thread.jsx`
- `sanghathi-Frontend/src/pages/Thread/Message/Message.jsx`
- `sanghathi-Frontend/src/pages/Report/Report.jsx`
- `sanghathi-Frontend/src/App.jsx`

## Validation

- Source diagnostics: no errors found in updated files.
- Backend tests: passed (`2/2` suites, `4/4` tests).
- Frontend tests: passed (`2/2` files, `5/5` tests).
- TODO/FIXME scan: `0` remaining in backend/frontend `src`.

## Outcome

Phase 3 is complete. Existing TODO/FIXME debt in active source code has been cleared and replaced by implemented behavior where actionable.
