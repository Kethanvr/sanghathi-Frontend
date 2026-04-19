# Change Matrix (Current -> Proposed)

## Collection-level changes

| Current | Proposed | Action | Notes |
| --- | --- | --- | --- |
| `Users` | `users` | Normalize | Keep identity/auth only, align refs |
| `studentprofiles` + related student 1:1 docs | `student_profiles`, `student_academic_records`, `student_scores`, `student_attendance` | Consolidate + split by access pattern | Keep bounded subdocs; keep attendance separate |
| 9+ CareerReview collections | `student_career_profiles` | Consolidate | Reduce lookup and write amplification |
| `placements`, `internships`, `projects` | `student_placement_profiles` | Consolidate | Single placement module owner |
| `conversations` (session-style), `threads`, private/group conversation structures | `mentorship_sessions`, typed `conversations` | Clarify domain boundaries | Session vs messaging containers separated |
| `messages` (no parent id) | `messages` (with `conversationId`) | Expand schema | Enables stable ownership and indexing |
| none | `form_drafts`, `form_versions` | Add | Draft restore + version history |

## Field-level notable changes

| Area | Current issue | Proposed change |
| --- | --- | --- |
| Ref naming | `User` vs `Users` mismatch | Standardize ref targets |
| Professional body naming | `Proffessional...` typo variants | Normalize to `professional...` |
| Message ownership | No parent conversation/thread id | Add `conversationId` + type metadata |
| Thread message storage | Embedded id arrays can grow large | Query by `messages.conversationId` |
| User-scoped profile sprawl | Many small 1:1 documents | Consolidate by module with validation |

## Index-level changes

Add:

1. `messages`: `{ conversationId: 1, createdAt: -1 }`
2. `student_scores`: `{ userId: 1, semester: 1 }`
3. `form_drafts`: `{ userId: 1, formType: 1, scopeId: 1 }` unique
4. `form_versions`: `{ userId: 1, formType: 1, scopeId: 1, version: 1 }` unique

Review/remove after profiling:

1. Overlapping thread indexes not used in query plans

## API impact summary

- Student forms: route handlers need adapter layer during migration window.
- Conversation/thread endpoints: read path changes to message query by
  `conversationId`.
- Draft/version APIs: new endpoints introduced, no breaking change to existing
  submit endpoints.
