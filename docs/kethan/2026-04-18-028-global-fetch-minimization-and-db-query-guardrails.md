# 2026-04-18-028 Global Fetch Minimization and DB Query Guardrails

## 1. Update Summary
Implemented a cross-module optimization pass to reduce frontend overfetch and protect backend list/query endpoints from unbounded reads. Added pagination, limit caps, selective field retrieval, and targeted endpoint filtering on high-traffic routes.

## 2. What Was Wrong
- Several frontend pages fetched full datasets and filtered on the client side.
- Multiple backend list endpoints returned unbounded results.
- Thread and chat message reads could load full message history in one request.
- HOD mentor view used a multi-call waterfall (students + faculty) instead of a purpose-built aggregate endpoint.

## 3. What Was Fixed
- Backend users list endpoint now supports:
  - Pagination (`page`, `limit`)
  - Search (`q`)
  - Field projection (`fields`)
  - Optional profile enrichment (`includeProfiles`)
- Backend meetings list endpoint now supports:
  - Pagination and limit caps
  - Recipient/type/date filtering
  - Field projection
  - Pagination metadata in response
- Backend conversations list endpoint now supports:
  - Pagination and limit caps
  - Mentor/mentee/offline/status filters
  - Summary presence filter (`hasSummary`)
  - Field projection
- Backend thread endpoints optimized:
  - Thread list payload trims heavy fields
  - Thread detail message retrieval is paginated (`messagePage`, `messageLimit`)
- Backend private/group message retrieval optimized:
  - Conversation message retrieval now paginated (`page`, `limit`)
- Backend mentor endpoints optimized:
  - `mentees-with-profiles` and `mentees` now paginated
  - `allocation-students` now paginated and supports department/semester filtering
  - `mentors-with-mentees` now uses assigned mentor IDs, profile-backed department filtering, and pagination
- Meeting model indexes added for common list filters/sorts.
- Frontend updated to request bounded/filtered data on major list pages and chat/thread/message routes.
- HOD mentor page now uses a direct department-filtered mentors endpoint instead of client-side derivation from all students.

## 4. File Change Statistics
- Backend files changed: 7
- Frontend/docs files changed: 16
- Total files changed: 23

## 5. Files Changed
### Backend
- sanghathi-Backend/src/controllers/Conversation/messageContoller.js
- sanghathi-Backend/src/controllers/threadController.js
- sanghathi-Backend/src/controllers/userController.js
- sanghathi-Backend/src/models/Meeting.js
- sanghathi-Backend/src/routes/Student/mentorRoutes.js
- sanghathi-Backend/src/routes/conversationRoutes.js
- sanghathi-Backend/src/routes/meetingRoutes.js

### Frontend
- sanghathi-Frontend/docs/kethan/2026-04-18-028-global-fetch-minimization-and-db-query-guardrails.md
- sanghathi-Frontend/docs/kethan/README.md
- sanghathi-Frontend/src/components/chat/ChatSidebar.jsx
- sanghathi-Frontend/src/hooks/useChat.jsx
- sanghathi-Frontend/src/hooks/useMeeting.jsx
- sanghathi-Frontend/src/hooks/useMenteesData.js
- sanghathi-Frontend/src/pages/Director/DirectorViewMentors.jsx
- sanghathi-Frontend/src/pages/Hod/HodViewMentors.jsx
- sanghathi-Frontend/src/pages/Meeting/MeetingCalendar.jsx
- sanghathi-Frontend/src/pages/MentorAllocation/MentorAllocation.jsx
- sanghathi-Frontend/src/pages/MentorAllocation/MentorAssignmentDialog.jsx
- sanghathi-Frontend/src/pages/MentorMentee/MentorMenteeConversation.jsx
- sanghathi-Frontend/src/pages/Report/Report.jsx
- sanghathi-Frontend/src/pages/Thread/Thread.jsx
- sanghathi-Frontend/src/pages/Thread/ThreadWindow.jsx
- sanghathi-Frontend/src/pages/Users/UserList.jsx

## 6. Verification and Test Results
- Backend tests: passed (5 suites, 25 tests)
- Frontend tests: passed (3 files, 9 tests)
- Frontend production build: passed (`vite build`)
- File diagnostics on edited files: no errors

## 7. Risks or Follow-up Items
- Some pages still rely on client-side filtering for large datasets; converting those to server-driven filters can further reduce load.
- `allocation-students` currently uses large default page size for compatibility; future work can migrate this page to server-side pagination + filter sync.
- Reporting pages currently fetch bounded datasets in one request; export flows may need multi-page server-side exports for very large datasets.
