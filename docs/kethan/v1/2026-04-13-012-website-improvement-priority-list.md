# Sanghathi - Website Improvement Priority List

Date: 2026-04-13
Report ID: 012
Type: Product + engineering improvement plan

## Priority 1 - User Experience and Performance

1. Add server-side pagination support to all list-heavy pages and wire frontend pagination controls.
2. Add skeleton loaders for dashboard/list pages to reduce perceived wait time.
3. Move large report and mentor-allocation transforms to memoized selectors/hooks.
4. Add request cancellation in frontend for rapid filter changes (avoid stale response flashes).

## Priority 2 - Data Layer and API Reliability

1. Add consistent API response metadata (`results`, `pagination`) for every list endpoint.
2. Add endpoint-level query limits/validation for `page`, `limit`, and filter inputs.
3. Add a DB index audit script (`explain`-based) for high-traffic endpoints.
4. Add read/write timeout safeguards and retry strategy for external AI calls.

## Priority 3 - Security and Access Control

1. Extend 403 integration coverage across all sensitive mutation routes.
2. Add automated test to fail if any mounted route is missing `protect` guard where required.
3. Add stricter ownership checks for user-specific resources (`/users/:id`, `/threads/:id`).

## Priority 4 - Observability and Operations

1. Add health endpoints (`/health/live`, `/health/ready`) with DB and external-service checks.
2. Add request ID correlation in backend logs and include IDs in error responses.
3. Add daily backup scheduler wrapper over `backup-db-local.sh` with retention policy.

## Priority 5 - Frontend Architecture

1. Split route-heavy `App.jsx` into domain route modules and lazy route groups.
2. Consolidate repeated API calls into shared data hooks with caching.
3. Normalize route naming conventions and remove legacy redirect debt over time.

## Suggested Next Execution Order

1. Pagination and API consistency rollout
2. Security ownership checks + broader 403 integration tests
3. Health/observability and backup scheduling
4. Frontend architecture cleanup
