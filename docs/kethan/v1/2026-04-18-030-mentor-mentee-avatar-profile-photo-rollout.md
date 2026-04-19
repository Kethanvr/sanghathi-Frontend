# 2026-04-18-030 Mentor/Mentee Avatar Profile Photo Rollout

## 1. Update Summary
Implemented photo-first avatar rendering for mentor and mentee surfaces so uploaded profile photos are displayed in place of letter avatars across list, dashboard, thread, chat, and report views.

## 2. What Was Wrong
- Mentor and mentee list views showed fallback initial avatars even when profile photos existed in StudentProfile and FacultyProfile records.
- API responses powering mentor/mentee tables did not consistently expose profile photo fields.
- Thread/chat/report participant payloads relied on user avatar fields that were often empty when only profile photos were uploaded.

## 3. What Was Fixed
- Backend API enrichment:
  - Added profile photo selection and avatar mapping in mentorship routes.
  - Added profile photo selection and avatar mapping in users controller for both list and single-user responses.
  - Added shared backend profile-photo resolver utility and applied it to thread and private-conversation controllers to enrich participant/avatar payloads.
  - Mentors, mentees, and conversation/thread participants now return avatar/photo values derived from uploaded profile photos when available.
- Frontend rendering updates:
  - Added shared avatar resolver utility to prefer profile photo and fallback to initials.
  - Updated mentor and mentee table pages (director and HOD flows) to pass Avatar src.
  - Updated HOD mentor dashboard mentee table avatars to use uploaded photos.
  - Updated admin user list avatar rendering and fields request to include photo.
  - Updated shared MyAvatar component to consume resolved avatar source.
  - Updated mentees hook normalization to keep avatar available from profile photo.
  - Updated chat/thread/report avatar renderers to use resolved photo-first sources for authors and participants.

## 4. File Change Statistics
- Backend files changed: 5
- Frontend files changed: 17
- Docs files changed: 2
- Total files changed: 24

## 5. Files Changed
### Backend
- sanghathi-Backend/src/routes/Student/mentorRoutes.js
- sanghathi-Backend/src/controllers/userController.js
- sanghathi-Backend/src/controllers/threadController.js
- sanghathi-Backend/src/controllers/Conversation/privateConversationController.js
- sanghathi-Backend/src/utils/profilePhotoResolver.js

### Frontend
- sanghathi-Frontend/src/utils/avatarResolver.js
- sanghathi-Frontend/src/pages/Director/DirectorViewMentors.jsx
- sanghathi-Frontend/src/pages/Director/DirectorMenteesList.jsx
- sanghathi-Frontend/src/pages/Hod/HodViewMentors.jsx
- sanghathi-Frontend/src/pages/Hod/HodMenteesList.jsx
- sanghathi-Frontend/src/pages/Hod/HodMentorDashboard.jsx
- sanghathi-Frontend/src/pages/Users/UserList.jsx
- sanghathi-Frontend/src/hooks/useMenteesData.js
- sanghathi-Frontend/src/components/MyAvatar.jsx
- sanghathi-Frontend/src/components/chat/ChatConversationItem.jsx
- sanghathi-Frontend/src/components/chat/ChatWindow.jsx
- sanghathi-Frontend/src/components/chat/ChatMessageItem.jsx
- sanghathi-Frontend/src/pages/Thread/ThreadWindow.jsx
- sanghathi-Frontend/src/pages/Thread/ThreadList.jsx
- sanghathi-Frontend/src/pages/Thread/Message/Message.jsx
- sanghathi-Frontend/src/pages/Thread/NewThreadDialog.jsx
- sanghathi-Frontend/src/pages/Report/Report.jsx

### Documentation
- sanghathi-Frontend/docs/kethan/2026-04-18-030-mentor-mentee-avatar-profile-photo-rollout.md
- sanghathi-Frontend/docs/kethan/README.md

## 6. Verification and Test Results
- Backend diagnostics on changed files: no errors
- Frontend diagnostics on changed files: no errors
- Backend tests: passed (5 suites, 25 tests)
- Frontend tests: passed (3 files, 9 tests)
- Frontend production build: passed (vite build)

## 7. Risks or Follow-up Items
- Minor residual surfaces like bot/system/notification avatars are intentionally left unchanged because they are not mentor/mentee user-profile avatars.
- Optional follow-up: replace remaining direct Avatar usages with the shared avatar resolver helper for complete consistency and reduced duplication.
