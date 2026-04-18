# 2026-04-18-031 Faculty Mentees UI Parity and Thread Student-Avatar Focus

## 1. Update Summary
Aligned the faculty `/mentees` page UI with the HOD mentees list design, added mentee avatar/photo rendering there, updated navbar profile avatar hydration, and changed mentor-thread avatar display to focus on student images.

## 2. What Was Wrong
- Faculty `/mentees` used an older, plain table and did not show mentee avatar photos.
- Navbar account avatar could still show initials even when profile photo existed, because stored auth user data was stale.
- Thread member avatar sections showed both mentor and mentee avatars; mentor users requested student-focused avatar display.

## 3. What Was Fixed
- Faculty mentees page (`/mentees`) now uses the same modern card/table style as HOD mentees list.
- Added avatar column to faculty mentees list with profile-photo-first rendering and initials fallback.
- Added auth user profile hydration on app load (`/users/:id`) so navbar avatar reflects uploaded profile photo when available.
- Updated thread payloads to include `roleName` for participants/authors so frontend can identify student participants.
- Updated thread UI to show student participant avatars for faculty users in member/avatar surfaces.
- Updated thread creation dialog member display to hide mentor self-avatar for faculty while keeping participant data intact.

## 4. File Change Statistics
- Backend files changed: 2
- Frontend files changed: 6
- Docs files changed: 1
- Total files changed: 9

## 5. Files Changed
### Backend
- sanghathi-Backend/src/controllers/threadController.js
- sanghathi-Backend/src/services/threadService.js

### Frontend
- sanghathi-Frontend/src/context/AuthContext.jsx
- sanghathi-Frontend/src/pages/Faculty/FetchStudentProfile.jsx
- sanghathi-Frontend/src/pages/Thread/Thread.jsx
- sanghathi-Frontend/src/pages/Thread/ThreadList.jsx
- sanghathi-Frontend/src/pages/Thread/ThreadWindow.jsx
- sanghathi-Frontend/src/pages/Thread/NewThreadDialog.jsx

### Documentation
- sanghathi-Frontend/docs/kethan/2026-04-18-031-faculty-mentees-ui-parity-and-thread-student-avatar-focus.md

## 6. Verification and Test Results
- Diagnostics on all changed files: no errors
- Backend tests: passed (5 suites, 25 tests)
- Frontend tests: passed (3 files, 9 tests)
- Frontend production build: passed (`vite build`)

## 7. Risks or Follow-up Items
- Student-focused avatar filtering is currently applied for faculty role on thread member surfaces; if the same behavior is desired for HOD/director mentor-like flows, it can be extended with the same rule.
- If users keep very old localStorage auth entries, one refresh cycle may be needed for profile-hydration update to replace initials with uploaded photo.
