# Sanghathi - Phase 2 Draft Integration and Database Blueprint

Date: 2026-04-18
Report ID: 021
Type: Backend + Frontend implementation update
Status: Completed

## Update Summary

Completed phase-2 integration work for form-progress resilience and created the initial database blueprint package.

This update adds:

1. New backend draft/version APIs and Mongo models
2. New frontend draft persistence hook
3. Form-level integration on Student, Career Review, and Placement pages
4. Structured database documentation with current/proposed schema and ER diagram source files

## What Was Wrong

- Form progress could be lost on refresh/restart without draft persistence.
- No server-backed draft or version history endpoints existed.
- No restore flow existed for form checkpoints.
- Database redesign discussions were not yet captured in structured, reusable docs and ER artifacts.

## What Was Fixed

1. Backend draft/version infrastructure
- Added `FormDraft` model with unique key `(userId, formType, scopeId)`.
- Added `FormVersion` model for immutable version checkpoints.
- Added controller endpoints for:
  - load draft
  - save draft
  - create version
  - list versions
  - restore version
- Added new protected routes under `/api/forms`.

2. Frontend draft persistence foundation
- Added reusable `useDraftPersistence` hook with:
  - local draft save (debounced)
  - optional server sync
  - hydrate from local/server draft
  - sync state and last-saved metadata

3. Phase-2 form integrations
- `PrevAcademic.jsx`:
  - integrated draft persistence
  - added sync status and last-saved UI
  - added version checkpoint creation
  - added version history loading + restore action
  - submit flow now records submit version and clears local draft
- `Mooc.jsx`:
  - integrated draft persistence
  - added sync status + last-saved display
- `InternshipDetails.jsx`:
  - integrated draft persistence
  - added sync status + last-saved display

4. Database blueprint package
- Created `sanghathi-Frontend/docs/database/` with:
  - current schema documentation
  - proposed schema documentation
  - change matrix
  - migration plan
  - draft-sync/versioning architecture plan
  - ER source files in Mermaid and DBML for current/proposed schemas

5. Mongo MCP usage
- Performed read-only MCP connection sanity checks before implementation planning.
- No destructive Mongo operations executed.

## File Change Statistics

- Files added: 15
- Files updated: 6
- Files removed: 0
- Total touched: 21

## Files Changed

### Backend
- `sanghathi-Backend/src/models/FormDraft.js`
- `sanghathi-Backend/src/models/FormVersion.js`
- `sanghathi-Backend/src/controllers/formDraftController.js`
- `sanghathi-Backend/src/routes/formDraftRoutes.js`
- `sanghathi-Backend/src/index.js`

### Frontend
- `sanghathi-Frontend/src/hooks/useDraftPersistence.js`
- `sanghathi-Frontend/src/pages/Student/PrevAcademic.jsx`
- `sanghathi-Frontend/src/pages/CareerReview/Mooc.jsx`
- `sanghathi-Frontend/src/pages/Placement/InternshipDetails.jsx`

### Database docs
- `sanghathi-Frontend/docs/database/README.md`
- `sanghathi-Frontend/docs/database/current-schema.md`
- `sanghathi-Frontend/docs/database/proposed-schema.md`
- `sanghathi-Frontend/docs/database/change-matrix.md`
- `sanghathi-Frontend/docs/database/migration-plan.md`
- `sanghathi-Frontend/docs/database/draft-sync-versioning-plan.md`
- `sanghathi-Frontend/docs/database/er/current-schema.mmd`
- `sanghathi-Frontend/docs/database/er/current-schema.dbml`
- `sanghathi-Frontend/docs/database/er/proposed-schema.mmd`
- `sanghathi-Frontend/docs/database/er/proposed-schema.dbml`

### Log docs
- `sanghathi-Frontend/docs/kethan/2026-04-18-021-phase2-draft-integration-and-db-blueprint.md`
- `sanghathi-Frontend/docs/kethan/README.md`

## Verification and Test Results

- File diagnostics check for updated source files reported no syntax/type problems.
- Backend import-level runtime sanity attempt was blocked by missing runtime env in that shell session (`OPENAI_API_KEY` not present for `rag.js`), so full backend runtime boot validation was not completed in that command context.
- Read-only Mongo MCP connectivity verified before rollout planning.

## Risks or Follow-up Items

- Draft/version APIs currently use authenticated user ownership; mentee-edit workflows by mentors may require explicit ownership policy decisions.
- Cross-device conflict-resolution UI is still foundational and should be improved in subsequent iterations.
- Next phase should include schema modification scripts and controlled migration rollout using the new docs as source of truth.
