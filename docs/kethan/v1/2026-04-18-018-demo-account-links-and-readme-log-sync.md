# Sanghathi - Demo Account Links and README/Log Sync

Date: 2026-04-18
Report ID: 018
Type: Documentation update
Status: Completed

## Update Summary

Updated the root account/dashboard README with the provided frontend/backend GitHub repository links and role-wise demo login credentials, then synced this update into Kethan logs.

## What Was Wrong

- Root account inventory still had placeholder values for login emails and passwords.
- Frontend/backend repository links were not listed in the root inventory document.
- Kethan logs did not yet capture this credential/link sync update.

## What Was Fixed

1. Added repository links to root inventory:
- Frontend: https://github.com/Sanghathi/sanghathi-Frontend
- Backend: https://github.com/Sanghathi/sanghathi-Backend

2. Replaced account placeholders with provided demo credentials in `README-LOGINS-DASHBOARDS.md`:
- Student: `demostudent@emithru.com` / `demostudentpassword`
- Faculty: `demofaculty@emithru.com` / `demofacultypassword`
- Admin: `ghost@ex.com` / `ghost1234`
- Director: `demodirector@ex.com` / `demodirectorpassword`
- HOD: `demohod@ex.com` / `demohodpassword`

3. Added this report and indexed it in Kethan log README.

## File Change Statistics

- Files added: 1
- Files updated: 2
- Files removed: 0
- Total touched: 3

## Files Changed

- `README-LOGINS-DASHBOARDS.md`
- `sanghathi-Frontend/docs/kethan/2026-04-18-018-demo-account-links-and-readme-log-sync.md`
- `sanghathi-Frontend/docs/kethan/README.md`

## Verification and Test Results

- Verified root file now includes the provided GitHub links and all five role credentials.
- Verified Kethan log index contains report 018.
- No runtime code path changed; documentation-only update.

## Risks or Follow-up Items

- The root file now contains plaintext demo passwords; avoid committing real production credentials.
- If these credentials are shared publicly, rotate them periodically.
