# Sanghathi Database Blueprint

This folder contains the first implementation package for database cleanup and
form-progress resilience.

## Scope in this phase

- Document current MongoDB schema from code and backup metadata
- Define proposed target schema aligned to app modules
- Provide ER diagram source in Mermaid and DBML
- Provide current -> proposed change matrix
- Provide migration rollout plan
- Provide draft restore, sync, and version-history architecture plan

Search index implementation is intentionally excluded in this phase.

## Data sources used

1. Backend model files under `sanghathi-Backend/src/models/`
2. Route/controller access patterns under `sanghathi-Backend/src/routes/` and
   `sanghathi-Backend/src/controllers/`
3. Backup schema snapshot:
   `database-backups/cmrit-2026-04-13T18-30-03-439Z/schema-summary.json`
4. Read-only Mongo MCP check against Atlas connection (sample collection read)

## Files

- `current-schema.md` - current-state schema map and issues
- `proposed-schema.md` - target schema design
- `change-matrix.md` - explicit current -> proposed changes
- `migration-plan.md` - phased migration strategy and rollback model
- `draft-sync-versioning-plan.md` - form recovery and history architecture
- `er/current-schema.mmd` - current ER diagram source (Mermaid)
- `er/current-schema.dbml` - current ER diagram source (DBML)
- `er/proposed-schema.mmd` - proposed ER diagram source (Mermaid)
- `er/proposed-schema.dbml` - proposed ER diagram source (DBML)

## How to use the ER sources

1. Mermaid:
   - Open any `.mmd` file in a Mermaid-compatible renderer.
2. DBML:
   - Paste `.dbml` content into dbdiagram.io or compatible DBML tools.

## Implementation status

This is a design-and-rollout baseline.

In addition to docs, initial draft/version scaffolding is now added in code:

1. Backend models:
   - `sanghathi-Backend/src/models/FormDraft.js`
   - `sanghathi-Backend/src/models/FormVersion.js`
2. Backend controller and routes:
   - `sanghathi-Backend/src/controllers/formDraftController.js`
   - `sanghathi-Backend/src/routes/formDraftRoutes.js`
   - mounted at `/api/forms` in backend app router
3. Frontend reusable hook scaffold:
   - `sanghathi-Frontend/src/hooks/useDraftPersistence.js`

No production collections were modified by this step.
