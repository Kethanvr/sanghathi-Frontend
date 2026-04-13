# Workspace Scripts

## Start Servers

Use this script from the workspace root:

- Start both backend and frontend:
  - `./scripts/start-servers.sh`
- Start only backend:
  - `./scripts/start-servers.sh --backend`
- Start only frontend:
  - `./scripts/start-servers.sh --frontend`

## Run All Tests

Use this script from the workspace root:

- Run backend + frontend tests:
  - `./scripts/run-all-tests.sh`
- Run backend tests only:
  - `./scripts/run-all-tests.sh --backend`
- Run frontend tests only:
  - `./scripts/run-all-tests.sh --frontend`

## Notes

- Backend command used: `npm test -- --runInBand`
- Frontend command used: `npm test`
- Ensure dependencies are installed in both projects before running scripts.
