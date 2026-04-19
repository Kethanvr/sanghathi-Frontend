# Migration Plan

## Principles

1. No destructive switch in one shot.
2. Prefer additive schema first, then cutover, then cleanup.
3. Keep rollback paths until validation gates pass.

## Phase 0: Prep

1. Freeze schema change window for target modules.
2. Capture backup snapshot and collection counts.
3. Add metrics for read/write error rates and endpoint latency.

## Phase 1: Additive foundation

1. Create new target collections:
   - `student_career_profiles`
   - `student_placement_profiles`
   - `form_drafts`
   - `form_versions`
2. Add required indexes and validators in `warn` mode.
3. Keep existing collections untouched.

## Phase 2: Backfill

1. Build migration scripts per module.
2. Backfill in chunks by user id ranges.
3. Write migration audit logs (counts, failures, retries).
4. Reconcile with count and sample hash checks.

## Phase 3: Dual read/write

1. Add feature flags for migration routing.
2. Enable dual writes for selected modules.
3. Compare old vs new reads for sampled users.
4. Keep UI read path on old collections until parity threshold passes.

## Phase 4: Read cutover

1. Flip read flag module-by-module.
2. Keep dual writes active for a stabilization period.
3. Monitor error rate, p95 latency, and mismatch counters.

## Phase 5: Decommission

1. Disable old writes.
2. Archive old collections to backup namespace.
3. Remove legacy code branches after final sign-off.

## Rollback model

Any phase rollback should be reversible by feature flag:

1. Disable new read path.
2. Keep old collections as source of truth during rollback window.
3. Re-run reconciliation job before retry.

## Validation gates

Must pass before each promotion:

1. Count parity per user-scoped module.
2. Field-level spot checks on sampled users.
3. Endpoint contract regression tests pass.
4. No sustained increase in 4xx/5xx and no p95 regression beyond threshold.

## Suggested implementation order

1. CareerReview consolidation
2. Placement consolidation
3. Conversation/message ownership normalization
4. Student academic-domain restructuring
5. Draft/version infrastructure rollout
