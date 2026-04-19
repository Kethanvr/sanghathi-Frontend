# Sanghathi - App Improvement Plan (Post Phase 7)

Date: 2026-04-13
Report ID: 010
Type: Forward roadmap requested by user

## Priority 1 - Security and Authorization Completion

1. Expand 403 integration tests to remaining admin-sensitive route groups:
- placements
- career review write endpoints
- faculty/student profile mutation endpoints

2. Add contract tests for token expiry and malformed token handling.

3. Add CI gate to fail PRs if protected-route suites fail.

## Priority 2 - Validation and API Consistency

1. Standardize request validation middleware usage across all POST/PATCH endpoints.

2. Introduce shared response envelope for success/error payload consistency.

3. Add integration tests for 400 validation failures (schema mismatch, missing required fields).

## Priority 3 - Observability and Reliability

1. Add request-id correlation to backend logs.

2. Add health endpoint checks for DB and critical external dependencies.

3. Add basic uptime/error dashboards from log outputs.

## Priority 4 - Test and Quality Gates

1. Add root CI workflow to run:
- unified tests (`./scripts/run-all-tests.sh`)
- lint checks for backend/frontend

2. Raise frontend coverage goals in phases:
- current ~64% statements
- target 75%+ for core modules (auth, api, routes)

3. Add smoke E2E checks for login + dashboard load + protected redirects.

## Priority 5 - Developer Experience

1. Add `.env.example` for backend and frontend with required keys.

2. Extend startup script with optional `--install` and dependency validation.

3. Add a root quickstart README section referencing `scripts/start-servers.sh` and `scripts/run-all-tests.sh`.

## Priority 6 - Product/UX Improvements

1. Thread module split into smaller components and hooks for maintainability.

2. Improve report page UX (filter clarity, performance for large datasets).

3. Add user-facing error boundary screens with actionable retry guidance.

## Suggested Execution Order

1. Security/authorization completion
2. Validation/API consistency
3. CI quality gates
4. Observability
5. UX/product refinements

## Definition of Done for Next Milestone

- All critical protected routes covered by 401/403 integration tests.
- Validation failure integration tests covering major create/update APIs.
- Unified tests + lint running in CI on every PR.
- Root quickstart docs and scripts used as default developer entry point.
