# 2026-04-18-029 HOD and Director Route Navigation Normalization

## 1. Update Summary
Fixed role-navigation drift where HOD users could enter director-prefixed mentor pages and then hit unauthorized screens while navigating back via breadcrumbs/buttons.

## 2. What Was Wrong
- Mentor list and mentees pages reused director-oriented components with hardcoded director route prefixes.
- In HOD flow, this produced URLs like /director/mentor/:id/mentees and /director/mentee-profile/:id.
- Breadcrumb/back links from those pages sent HOD users to /director/dashboard, which is director-only and showed Unauthorized.

## 3. What Was Fixed
- Added role-aware route prefixing in shared mentor pages:
  - If current context is HOD, links are generated under /hod.
  - Otherwise links remain under /director.
- Added explicit HOD route aliases in app routing:
  - /hod/mentor/:mentorId/mentees
  - /hod/mentee-profile/:menteeId
- Kept existing director-prefixed pages working for compatibility, but navigation now self-corrects to HOD paths when current user role is HOD.

## 4. File Change Statistics
- Frontend files changed: 4
- Backend files changed: 0
- Total files changed: 4

## 5. Files Changed
- sanghathi-Frontend/src/App.jsx
- sanghathi-Frontend/src/pages/Director/DirectorViewMentors.jsx
- sanghathi-Frontend/src/pages/Director/DirectorMenteesList.jsx
- sanghathi-Frontend/docs/kethan/2026-04-18-029-hod-director-route-navigation-normalization.md

## 6. Verification and Test Results
- Frontend diagnostics on changed files: no errors
- Frontend production build: passed (vite build)
- Runtime expectation:
  - HOD flow now remains in /hod/* routes for mentor list, mentees list, and mentee profile
  - Breadcrumb/back actions from mentees list return to /hod/mentors and /hod/dashboard for HOD users

## 7. Risks or Follow-up Items
- Existing bookmarked director-prefixed URLs may still be opened manually by HOD users, but in-page navigation now shifts back to HOD prefixes.
- Optional follow-up: add hard redirects from director-prefixed mentor routes to hod-prefixed routes when role is HOD to fully canonicalize URLs.
