# Current Schema (As-Is)

## Summary

The app uses a hybrid model:

- Central identity in `Users`
- Many user-linked 1:1 collections (Student, CareerReview, Placement)
- Conversation/thread models with shared message model
- Several nested arrays for semester and activity data

This section captures current structure and known pain points before migration.

## Core entities by domain

### Identity and access

- `Users`
  - role reference, profile reference, auth fields, status, activity
- `roles`
  - role id/name/permissions

### Student profile and academic

- `studentprofiles`
- `admissiondetails`
- `academicdetails`
- `attendances`
- `parentdetails`
- `contactdetails`
- `localguardians`
- `ptmrecords`
- `iatmarks`
- `externals`
- `poattainments`
- `tylscores`

### Career review

- `activities`
- `hobbies`
- `clubs`
- `clubevents`
- `proffessionalbodies`
- `pbevents`
- `miniprojectdatas`
- `moocdatas`
- `careercounsellings`

### Placement

- `placements`
- `internships`
- `projects`

### Mentorship and conversations

- `mentorships`
- `conversations` (mentor/mentee session model)
- `threads`
- `privateconversations`
- `groupconversations`
- `messages`

### System

- `notifications`
- `meetings`
- `feedbackdetails`
- `complaints`

## Relationship notes (current)

- Most domain records are keyed by `userId` with practical 1:1 usage.
- `mentorships` is a link collection (`mentorId` <-> `menteeId`).
- `threads` and conversation collections store arrays of message ids.
- `messages` does not have an explicit parent conversation/thread id.

## Current index posture (high-level)

Strengths:

- Good indexing in `threads`, `notifications`, `mentorships`, `Users`.
- Unique constraints exist in several 1:1 collections (for example placement,
  many CareerReview models).

Gaps:

- Inconsistent index coverage across user-bound collections.
- Some models have inconsistent ref names (`User` vs `Users`).
- Message ownership index path is missing because parent id is missing.

## Key structural issues

1. Fragmentation in CareerReview
- Many small user-scoped collections that are usually accessed together.

2. Message ownership ambiguity
- Message docs lack a canonical parent id to thread/private/group conversation.

3. Unbounded arrays risk
- Thread/conversation message id arrays can grow without guardrails.

4. Inconsistent naming and constraints
- Mixed model ref names and spelling inconsistencies (`Proffessional...`).
- `projects` model behavior differs from other user-unique placement models.

5. Deeply nested semester structures
- Harder to evolve and query efficiently as data volume grows.

## Evidence anchors

- Models: `sanghathi-Backend/src/models/`
- Backup schema summary:
  `database-backups/cmrit-2026-04-13T18-30-03-439Z/schema-summary.json`
- Live MCP sanity check: read-only query verified Atlas connection and role data
