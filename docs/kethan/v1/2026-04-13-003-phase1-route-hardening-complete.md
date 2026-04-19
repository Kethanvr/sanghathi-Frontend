# Sanghathi - Phase 1 Route Hardening Completed

Date: 2026-04-13
Report ID: 003
Phase: 1 (Auth hardening for remaining route files)
Status: Completed

## Objective

Harden the remaining unprotected backend route files in a single structured pass.

## Completion Summary

- Target route files identified in roadmap: 33
- Actual router files hardened in this pass: 32
- Router files without auth protection after pass: 0
- Route-folder files still without `protect`: 1 (`Student/sendEmail.js`)

Note: `Student/sendEmail.js` is a cron utility file in the routes directory and does not define an Express router. It is not an HTTP endpoint and therefore not route-protectable with `router.use(protect)`.

## Security Changes Applied

1. Added `protect` middleware to all remaining router-based files.
2. Added stronger `restrictTo("admin", "hod", "director")` controls for high-risk/admin scope:
   - Admin IAT routes
   - Admin grouped-user view route
   - Role lookup routes
   - Non-production test routes (`test-summary`, `test-upload`)
3. Converted legacy CommonJS `Conversation/groupConversationRoutes.js` to ESM and applied auth guard.

## Files Updated (32)

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
- `sanghathi-Backend/src/routes/Student/studentProfileRoutes.js`
- `sanghathi-Backend/src/routes/testSummaryRoutes.js`
- `sanghathi-Backend/src/routes/testUploadRoute.js`

## Validation

- Router coverage scan: `ROUTER_FILES_WITHOUT_PROTECT_COUNT=0`
- Route-folder broad scan: only `Student/sendEmail.js` remains without `protect` (non-router utility)
- Backend route diagnostics check: no errors found in `src/routes`

## Result

Phase 1 is complete: all active route routers are now authenticated, and admin/test-sensitive endpoints have role restrictions added.
