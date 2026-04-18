# 1. Update Summary

Implemented Phase 1 of mentees data stability and loading UX hardening.
The `/mentees` and related mentor-mentee views now fetch mentees with profile data in a single backend call, use a shared frontend hook, and render skeleton table rows while loading.
Auth resilience was also improved so refresh/session transitions no longer fail due to missing bearer headers.

# 2. What Was Wrong

1. Mentees pages used a two-step fetch pattern (mentees, then per-mentee profile calls), causing N+1 latency and intermittent `N/A` values.
2. Some requests used raw axios while others used the shared API client, causing inconsistent auth header behavior after refresh.
3. Error messages often collapsed auth failures into misleading empty-state messages like “No mentees found.”
4. No reusable table skeleton existed for data-heavy views, so slow fetches looked broken.
5. Backend auth middleware only trusted Bearer headers; cookie-auth fallback was missing.

# 3. What Was Fixed

1. Backend auth hardening:
- Added `cookie-parser` middleware in backend app bootstrap.
- Updated `protect` middleware to accept JWT from Bearer header first, and fallback to `req.cookies.jwt`.

2. Backend mentees endpoint optimization:
- Added `GET /api/mentorship/:mentorId/mentees-with-profiles`.
- Endpoint now returns mentee core fields and profile fields (`department`, `sem`, `usn`) in one response.
- Optimized legacy `/:mentorId/mentees` endpoint with `select` and `lean`.

3. Shared frontend fetch path:
- Added `useMenteesData` hook to centralize mentees fetching, loading, error handling, and normalization.
- Migrated these pages to use the shared hook:
  - Faculty mentees list
  - HOD mentees list
  - Director mentees list
  - HOD mentor dashboard mentees table
  - Mentor-mentee conversation mentee selector

4. Skeleton loader rollout (Phase 1):
- Added reusable `TableRowsSkeleton` component for table/list loading states.
- Wired skeleton rows into migrated mentees list tables.

5. API client resiliency:
- Enabled `withCredentials` on the shared axios instance.
- Added centralized 401 handling with redirect preservation via query/session storage.
- Updated login flow to consume preserved redirect target after authentication.

# 4. File Change Statistics

Implementation scope:
- Backend files changed: 4
- Frontend source files changed/added: 9
- Docs files added: 1
- Total: 14

Verification scope:
- Backend tests: 25/25 passed
- Frontend tests: 9/9 passed
- Frontend production build: passed
- Diagnostics on edited files: no errors

# 5. Files Changed

## Backend
- `sanghathi-Backend/package.json`
- `sanghathi-Backend/src/index.js`
- `sanghathi-Backend/src/controllers/authController.js`
- `sanghathi-Backend/src/routes/Student/mentorRoutes.js`

## Frontend
- `sanghathi-Frontend/src/utils/axios.js`
- `sanghathi-Frontend/src/hooks/useMenteesData.js` (new)
- `sanghathi-Frontend/src/components/skeletons/TableRowsSkeleton.jsx` (new)
- `sanghathi-Frontend/src/pages/Faculty/FetchStudentProfile.jsx`
- `sanghathi-Frontend/src/pages/Hod/HodMenteesList.jsx`
- `sanghathi-Frontend/src/pages/Director/DirectorMenteesList.jsx`
- `sanghathi-Frontend/src/pages/Hod/HodMentorDashboard.jsx`
- `sanghathi-Frontend/src/pages/MentorMentee/MentorMenteeConversation.jsx`
- `sanghathi-Frontend/src/pages/Login.jsx`

## Docs
- `sanghathi-Frontend/docs/kethan/2026-04-18-027-mentees-fetch-stability-and-skeleton-rollout-phase1.md` (new)

# 6. Verification and Test Results

1. Backend dependency install:
- Command:
  `cd sanghathi-Backend && bun install`
- Result:
  - Added `cookie-parser@1.4.7`

2. Backend test suite:
- Command:
  `cd sanghathi-Backend && bun run test`
- Result:
  - Test Suites: 5 passed, 5 total
  - Tests: 25 passed, 25 total

3. Frontend test suite:
- Command:
  `cd sanghathi-Frontend && bun run test`
- Result:
  - Test Files: 3 passed
  - Tests: 9 passed

4. Frontend production build:
- Command:
  `cd sanghathi-Frontend && bun run build`
- Result:
  - Build succeeded
  - Large chunk warnings remain pre-existing optimization follow-up (not blocking)

5. Static diagnostics:
- Edited-file diagnostics: no compile/language-server errors on changed files.

# 7. Risks or Follow-up Items

1. Add focused integration tests for the new endpoint `/:mentorId/mentees-with-profiles` response contract.
2. Expand skeleton rollout to additional table-heavy pages (Attendance, Scorecard, Reports) in Phase 2.
3. Consider adding request cancelation/abort handling in `useMenteesData` to prevent stale updates on rapid route changes.
4. Add backend pagination support on mentees endpoint if mentor loads grow significantly.
5. Monitor auth redirect flow in browser tests to confirm smooth 401->login->return behavior in all role paths.

# 8. Phase 3 UI + Threads/Report Delta (2026-04-18)

Implemented a frontend UX sweep for `/threads`, `/report`, chat message rendering, and mentees list presentation.

1. Threads page (`/threads`)
- Added in-page search for title/topic/participant name.
- Added status and category filters with one-click clear.
- Kept existing thread actions (`View`, `Delete` for closed threads) intact.
- Switched default table page size from 5 to 10 rows.

2. Report page (`/report`)
- Added true table pagination with default 10 rows per page.
- Retained existing search/filter system and expanded filters with Semester.
- Added support for explicit `In Progress` status filtering in addition to Open/Closed.
- Preserved export-to-Excel and chat dialog behavior.

3. Chat interface consistency
- Updated thread message rendering to reliably align:
  - sent messages on the right,
  - received messages on the left.
- Normalized sender identity matching to handle both string/Object sender shapes.
- Applied the same sender-side logic fix to the generic chat component path.
- Improved chat bubble visual styling for readability and consistent spacing.

4. Mentees table UX (HOD/Director/Faculty variants)
- Moved avatar rendering into the Name column so profile picture appears directly before mentee name.
- Kept fallback avatar initials when image is unavailable.

5. Files updated in this delta
- `sanghathi-Frontend/src/pages/Thread/Thread.jsx`
- `sanghathi-Frontend/src/pages/Thread/ThreadList.jsx`
- `sanghathi-Frontend/src/pages/Report/Report.jsx`
- `sanghathi-Frontend/src/pages/Thread/Message/Message.jsx`
- `sanghathi-Frontend/src/components/chat/ChatMessageItem.jsx`
- `sanghathi-Frontend/src/components/chat/ChatMessageList.jsx`
- `sanghathi-Frontend/src/pages/Director/DirectorMenteesList.jsx`
- `sanghathi-Frontend/src/pages/Hod/HodMenteesList.jsx`
- `sanghathi-Frontend/src/pages/Faculty/FetchStudentProfile.jsx`

6. Validation results
- Edited-file diagnostics: no language-service errors.
- Frontend production build: passed (`bun run build`).
- Non-blocking large chunk warnings remain and are pre-existing optimization follow-ups.

# 9. Thread + Mentor UX Delta (2026-04-18)

Implemented additional UX polish requested on thread and mentor-management flows.

1. Thread detail card improvements (`/threads/:threadId`)
- Added a top-level `Back to Threads` action at the top of the thread card.
- Updated message age display UI (for labels like `3 months ago`) to a cleaner time-pill style with icon.
- Normalized relative-time label formatting for compact readability (`mo`, `h`, `d`, etc. where applicable).

2. HOD/Director mentors search (`/hod/mentors`, `/director/mentors`)
- Expanded search to match not only mentor name/email, but also student names under that mentor.
- Updated search placeholder text to clearly indicate student-search support.

3. Mentor avatar in mentees header (`/hod/mentor/:mentorId/mentees` and director equivalent)
- Added mentor profile avatar before the mentor title block in the mentees page header.
- Uses existing avatar resolver with initials fallback when image is unavailable.

4. Backend support for student-name mentor search
- Enhanced `GET /mentors/mentors-with-mentees` payload to include `menteeNames` per mentor.
- Computed from mentorship records and student user lookups in one route.

5. Files updated in this delta
- `sanghathi-Frontend/src/pages/Thread/ThreadWindow.jsx`
- `sanghathi-Frontend/src/pages/Thread/Message/Message.jsx`
- `sanghathi-Frontend/src/pages/Director/DirectorViewMentors.jsx`
- `sanghathi-Frontend/src/pages/Director/DirectorMenteesList.jsx`
- `sanghathi-Backend/src/routes/Student/mentorRoutes.js`

6. Validation results
- Frontend diagnostics on edited files: clean.
- Frontend production build: passed (`bun run build`).
- Backend tests: passed (`25/25`).
