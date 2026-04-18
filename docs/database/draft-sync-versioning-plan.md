# Draft Restore, Sync, and Version History Plan

## Objective

Make form progress resilient for all scoped form groups:

1. Student onboarding forms
2. Career Review forms
3. Placement forms

Users must recover progress after refresh/browser restart and optionally restore
older versions.

## Architecture (recommended)

Local-first + server-sync hybrid.

1. Local draft store (fast recovery)
- Persist draft snapshots in browser storage (IndexedDB preferred).
- Save with debounce (for example 2 to 5 seconds after change).

2. Server draft sync (cross-device continuity)
- Sync draft snapshots to backend `form_drafts`.
- Maintain checksum/version token to detect stale writes.

3. Version history (audit + restore)
- Append immutable snapshots to `form_versions` on important events:
  - manual save
  - submit
  - explicit checkpoint
  - restore action

## Backend data model proposal

### `form_drafts`

- `_id`
- `userId`
- `formType` (academic/contact/mooc/placement/etc)
- `scopeId` (optional per-record scoping)
- `draftData` (object)
- `version` (number)
- `checksum` (string)
- `updatedAt`, `createdAt`

Indexes:

1. unique `{ userId: 1, formType: 1, scopeId: 1 }`
2. `{ updatedAt: -1 }`

### `form_versions`

- `_id`
- `userId`
- `formType`
- `scopeId`
- `version` (incremental)
- `snapshot` (object)
- `changedFields` (array of strings)
- `reason` (manual-save, submit, restore, autosave-checkpoint)
- `createdAt`

Indexes:

1. unique `{ userId: 1, formType: 1, scopeId: 1, version: 1 }`
2. `{ userId: 1, formType: 1, scopeId: 1, createdAt: -1 }`

## API contract proposal

1. Save draft
- `PUT /api/forms/drafts/:formType`
- body: `{ scopeId, draftData, version, checksum }`

2. Load draft
- `GET /api/forms/drafts/:formType?scopeId=...`

3. Create explicit version
- `POST /api/forms/versions/:formType`
- body: `{ scopeId, snapshot, reason, changedFields }`

4. List versions
- `GET /api/forms/versions/:formType?scopeId=...&limit=...`

5. Restore version
- `POST /api/forms/versions/:formType/:version/restore`

## Frontend integration pattern

Create shared hook and apply to all target forms.

### Hook contract (example)

`useDraftPersistence({ formType, scopeId, watch, reset, getValues })`

Responsibilities:

1. Load local draft on mount.
2. Load server draft if newer than local.
3. Debounced local save on watched changes.
4. Background server sync with retry/backoff.
5. Expose `hasUnsavedChanges`, `lastSavedAt`, `syncState`.

## Conflict handling

Detect by checksum/version mismatch.

Resolution options:

1. Keep local draft
2. Use server draft
3. Manual merge (field-by-field)

Conflict UI should appear only when both local and server changed since last
common version.

## Restore UX

Each form page gets:

1. Draft status chip (Saved, Syncing, Conflict, Error)
2. Restore prompt on mount when draft exists
3. Version timeline drawer/modal with restore action

## Cleanup rules

1. On successful final submit, mark draft as clean or archive.
2. Keep version history by retention policy (for example 90 or 180 days).
3. Keep only latest N autosave checkpoints per form to control storage.

## Test scenarios

1. Refresh mid-edit -> data restored.
2. Browser restart -> data restored.
3. Offline edits -> local restore works, sync retries when online.
4. Concurrent edits on two devices -> conflict flow works.
5. Restore old version -> form state replaced and new version checkpoint added.
