# Sanghathi - Global Progress Restore Expansion for Frontend Data Entry

Date: 2026-04-18
Report ID: 022
Type: Frontend implementation update
Status: Completed

## Update Summary

Expanded progress restore coverage from a few pilot forms to a broad frontend-wide implementation for data-entry flows.

This update adds:

1. Shared, provider-level draft persistence for all `react-hook-form` pages using `FormProvider`
2. Sensitive-field filtering in draft persistence (`password`, `token`, `secret`, `otp`, `pin`)
3. Restore support for audit and bulk-upload data-entry pages that do not use `FormProvider`
4. Scope normalization utility for user/mentee-aware draft keys

## What Was Wrong

- Draft restore was only integrated in selected forms, so many input pages still lost in-progress state on refresh/navigation.
- Bulk upload and audit-entry screens had no restore path for processing outcome context.
- Draft payloads could include sensitive fields unless explicitly guarded.

## What Was Fixed

1. Global auto-draft for hook-form pages
- Upgraded shared `FormProvider` to automatically attach `useDraftPersistence`.
- Draft keying now defaults to route-based `formType` and user/query scoped `scopeId`.
- Added opt-out prop (`disableAutoDraft`) for pages that already use custom draft/version logic.
- Excluded auth-like routes from auto-draft.

2. Hardened draft payload safety
- Added recursive draft sanitizer to strip sensitive keys before local/server persistence.
- Added File/Blob and Date normalization handling.
- Added checksum dedupe so unchanged values are not repeatedly version-bumped/saved.

3. Expanded non-hook-form audit data-entry coverage
- Added restore persistence for:
  - `AddAttendance`
  - `AddIat`
  - `AddTylMarks`
  - `AddMiniProjectDetails`
  - `AddMoocDetails`
  - `AddStudents`
  - `AddMarks`
- Restored summary state includes success/error counters and recent error lists (trimmed for storage safety).
- `AddStudents` additionally restores selected role tab (`student` / `faculty` / `admin`).

4. Duplicate-save prevention on custom pages
- Disabled provider-level auto draft on pages already using specialized draft logic:
  - `PrevAcademic`
  - `Mooc`
  - `InternshipDetails`

## File Change Statistics

- Files added: 2
- Files updated: 13
- Files removed: 0
- Total touched: 15

## Files Changed

### New
- `sanghathi-Frontend/src/utils/draftScope.js`
- `sanghathi-Frontend/docs/kethan/2026-04-18-022-global-progress-restore-expansion.md`

### Updated - shared draft infrastructure
- `sanghathi-Frontend/src/hooks/useDraftPersistence.js`
- `sanghathi-Frontend/src/components/hook-form/FormProvider.jsx`

### Updated - custom draft pages (opt-out from provider auto-draft)
- `sanghathi-Frontend/src/pages/Student/PrevAcademic.jsx`
- `sanghathi-Frontend/src/pages/CareerReview/Mooc.jsx`
- `sanghathi-Frontend/src/pages/Placement/InternshipDetails.jsx`

### Updated - audit/bulk data-entry pages
- `sanghathi-Frontend/src/pages/Admin/AddAttendance.jsx`
- `sanghathi-Frontend/src/pages/Admin/AddIat.jsx`
- `sanghathi-Frontend/src/pages/Admin/AddTylMarks.jsx`
- `sanghathi-Frontend/src/pages/Admin/AddMiniProjectDetails.jsx`
- `sanghathi-Frontend/src/pages/Admin/AddMoocDetails.jsx`
- `sanghathi-Frontend/src/pages/Admin/AddStudents.jsx`
- `sanghathi-Frontend/src/pages/Scorecard/AddMarks.jsx`

### Updated - log index
- `sanghathi-Frontend/docs/kethan/README.md`

## Verification and Test Results

- Diagnostics check run for all touched source files.
- Result: no syntax/type problems reported in modified files.
- Hook-form coverage is now centralized through `FormProvider`, so all pages using that provider automatically receive draft restore/save behavior.

## Risks or Follow-up Items

- Browser security does not allow restoring actual file handles after refresh (`<input type="file">`), so users may still need to re-select files; restored progress focuses on processing context/state.
- Existing page-level backend fetch logic in some modules may still need per-page conflict policy tuning (draft-vs-server precedence) for edge cases.
- Next improvement can add a shared draft status banner component for all pages to make restore state visible consistently.
