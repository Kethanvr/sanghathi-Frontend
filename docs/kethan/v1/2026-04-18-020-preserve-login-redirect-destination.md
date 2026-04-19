# Sanghathi - Preserve Intended Route During Login Redirect

Date: 2026-04-18
Report ID: 020
Type: Authentication flow update
Status: Completed

## Update Summary

Updated the frontend auth flow so unauthenticated users are redirected to `/login` with their original destination preserved, then sent back to that route after a successful login.

## What Was Wrong

- Protected routes already redirected unauthenticated users to `/login`, but the original destination was not preserved.
- After login, users were always sent to `/`, even when they originally tried to open a specific protected page.
- This created extra navigation friction for mentor, dashboard, and admin pages.

## What Was Fixed

1. Protected route redirect now carries the requested location:
- `ProtectedRouteWrapper` now uses `useLocation()` and passes `state={{ from: location }}` to the login redirect.

2. Login now returns users to their original destination:
- `Login.jsx` reads `location.state?.from`.
- After a successful login, the app navigates back to the saved pathname and search string when available.

3. Behavior remains safe for direct login visits:
- If there is no saved destination, login still routes users to `/` as before.

## File Change Statistics

- Files added: 1
- Files updated: 2
- Files removed: 0
- Total touched: 3

## Files Changed

- `sanghathi-Frontend/src/ProtectedRoute.jsx`
- `sanghathi-Frontend/src/pages/Login.jsx`
- `sanghathi-Frontend/docs/kethan/2026-04-18-020-preserve-login-redirect-destination.md`

## Verification and Test Results

- Verified the protected route redirect now includes the original location in route state.
- Verified the login page reads the saved destination and navigates back after successful authentication.
- Ran file-level validation on the edited frontend files; no syntax errors were reported.

## Risks or Follow-up Items

- If the login page is opened directly without a saved route state, the app will continue to redirect to `/`, which is expected.
- If future auth flows add refresh-token or session restore logic, the same redirect preservation pattern should be kept consistent.
