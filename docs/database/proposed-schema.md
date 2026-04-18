# Proposed Schema (Target)

## Design goals

1. Store data accessed together in the same document where bounded.
2. Keep high-growth relationships as references.
3. Reduce collection sprawl for user-scoped profile modules.
4. Make message ownership explicit.
5. Keep migration-safe structure for phased rollout.

## Proposed collection layout

### Identity

- `users`
  - identity/auth core only
  - role reference and lightweight profile flags
- `roles`

### Student core

- `student_profiles`
  - personal and enrollment-level identity for student
  - stable profile references and normalized naming

- `student_academic_records`
  - admissions + prior academics + guardian/contact bundles
  - sem-structured but bounded subdocuments

- `student_scores`
  - iat/external/po/tyl grouped by semester

- `student_attendance`
  - keep as separate document domain; flatten key paths where needed for query

### Student development

- `student_career_profiles`
  - activities, clubs, mooc, mini projects, hobbies, counselling
  - one document per user with bounded arrays + validation guardrails

### Placement

- `student_placement_profiles`
  - placements + internships + projects grouped by user

### Mentorship and communication

- `mentorships`
  - mentor/mentee mapping (reference model)

- `mentorship_sessions`
  - replaces overloaded session conversation model

- `conversations`
  - conversation metadata (private/group/thread-like typed container)

- `messages`
  - must include `conversationId` and message metadata
  - remove message id arrays from conversation/thread documents

### System

- `notifications`
- `meetings`
- `feedback`
- `complaints`

### New for resilience

- `form_drafts`
  - latest draft snapshot per user/form scope

- `form_versions`
  - append-only timeline for restore/history

## Index and constraint direction

Required patterns:

- user-scoped collections: unique `(userId)` where truly 1:1
- semester queries: compound `(userId, semester)` where used
- messages: `(conversationId, createdAt)` for timeline reads
- drafts: `(userId, formType, scopeId)` unique
- versions: `(userId, formType, scopeId, version)` unique

## Validation direction

- Add MongoDB JSON Schema validators gradually:
  - start with `validationAction: warn`
  - shift to `error` after migration confidence

## Why this shape works for this app

- Dashboard and profile pages read grouped user data by module.
- Mentorship and messaging need reference scalability.
- Form restore/versioning needs separate draft/history lifecycle.
