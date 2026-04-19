# Sanghathi - Next Improvements Roadmap

Date: 2026-04-13
Report ID: 002
Type: Follow-up roadmap after security and routing hardening pass

## Snapshot Metrics

- Unprotected backend route files: 33
- Backend `console.log` and `console.error` calls: 149
- Frontend `console.log` and `console.error` calls: 268
- Backend TODO/FIXME markers: 3
- Frontend TODO/FIXME markers: 11

## Highest Priority Work

1. Complete auth and role protection on remaining route files.
2. Remove or gate unsafe/debug logging in production code paths.
3. Expand automated test coverage for auth, validation, and critical business flows.
4. Resolve remaining TODO/FIXME markers with tracked issues.

## Unprotected Route Files (Needs `protect` / `restrictTo` review)

- `sanghathi-Backend/src/routes/Admin/IatmarksRouter.js`
- `sanghathi-Backend/src/routes/Admin/ViewUserRoutes.js`
- `sanghathi-Backend/src/routes/CampusBuddy/campusBuddy.js`
- `sanghathi-Backend/src/routes/CareerReview/ActivityRoutes.js`
- `sanghathi-Backend/src/routes/CareerReview/CareerCounsellingRoutes.js`
- `sanghathi-Backend/src/routes/CareerReview/HobbiesRoutes.js`
- `sanghathi-Backend/src/routes/CareerReview/MiniProjectRoutes.js`
- `sanghathi-Backend/src/routes/CareerReview/MoocRoutes.js`
- `sanghathi-Backend/src/routes/CareerReview/ProffessionalBodyRoutes.js`
- `sanghathi-Backend/src/routes/Complain/ComplaintRoutes.js`
- `sanghathi-Backend/src/routes/Conversation/groupConversationRoutes.js`
- `sanghathi-Backend/src/routes/Conversation/messageRoutes.js`
- `sanghathi-Backend/src/routes/Conversation/privateConversationRoutes.js`
- `sanghathi-Backend/src/routes/Faculty/FacultyDetailsRoutes.js`
- `sanghathi-Backend/src/routes/Feedback/feedbackRoutes.js`
- `sanghathi-Backend/src/routes/messageRoutes.js`
- `sanghathi-Backend/src/routes/notificationRoutes.js`
- `sanghathi-Backend/src/routes/Placements/InternshipRoutes.js`
- `sanghathi-Backend/src/routes/Placements/PlacementRoutes.js`
- `sanghathi-Backend/src/routes/Placements/ProjectRoutes.js`
- `sanghathi-Backend/src/routes/roleRoutes.js`
- `sanghathi-Backend/src/routes/Student/academicCRUD.js`
- `sanghathi-Backend/src/routes/Student/AdmissionRoutes.js`
- `sanghathi-Backend/src/routes/Student/contactDetailsRoutes.js`
- `sanghathi-Backend/src/routes/Student/localGuardianRoutes.js`
- `sanghathi-Backend/src/routes/Student/mentorRoutes.js`
- `sanghathi-Backend/src/routes/Student/parentDetailsRoutes.js`
- `sanghathi-Backend/src/routes/Student/poAttainmentRoutes.js`
- `sanghathi-Backend/src/routes/Student/PTMRoutes.js`
- `sanghathi-Backend/src/routes/Student/sendEmail.js`
- `sanghathi-Backend/src/routes/Student/studentProfileRoutes.js`
- `sanghathi-Backend/src/routes/testSummaryRoutes.js`
- `sanghathi-Backend/src/routes/testUploadRoute.js`

## Suggested Execution Order

1. Auth hardening pass for the 33 route files (grouped by domain folder).
2. Logging cleanup pass with environment-aware logger utility.
3. Test pass:
	- route protection tests (401/403)
	- request validation tests (400)
	- happy-path integration tests for core student/faculty/admin actions
4. Technical debt pass for TODO/FIXME cleanup and issue linking.

## Definition of Done for Next Phase

- 0 unprotected sensitive route files
- 0 production `console.log` calls in frontend/backend source
- all TODO/FIXME markers either resolved or mapped to issue IDs
- route auth/validation test coverage added for each critical module
