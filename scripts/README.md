# Workspace Scripts

## Start Servers

Use this script from the workspace root:

- Start both backend and frontend:
  - `./sanghathi-Frontend/scripts/start-servers.sh`
- Start only backend:
  - `./sanghathi-Frontend/scripts/start-servers.sh --backend`
- Start only frontend:
  - `./sanghathi-Frontend/scripts/start-servers.sh --frontend`

## Run All Tests

Use this script from the workspace root:

- Run backend + frontend tests:
  - `./sanghathi-Frontend/scripts/run-all-tests.sh`
- Run backend tests only:
  - `./sanghathi-Frontend/scripts/run-all-tests.sh --backend`
- Run frontend tests only:
  - `./sanghathi-Frontend/scripts/run-all-tests.sh --frontend`

## Local Database Backup and Structure

- Start local MongoDB container:
  - `./sanghathi-Frontend/scripts/start-local-mongo.sh`
- Show local MongoDB container status:
  - `./sanghathi-Frontend/scripts/start-local-mongo.sh --status`
- Stop local MongoDB container:
  - `./sanghathi-Frontend/scripts/start-local-mongo.sh --stop`

- Export source DB backup + schema summary and sync into local DB:
  - `./sanghathi-Frontend/scripts/backup-db-local.sh`

- Export backup files and schema summary only (skip local sync):
  - `./sanghathi-Frontend/scripts/backup-db-local.sh --no-local-sync`

## MongoDB Atlas Backup (No Local Container)

- Export Atlas/source MongoDB backup files only:
  - `./sanghathi-Frontend/scripts/backup-db-atlas.sh`

- Pass explicit Atlas URI when needed:
  - `./sanghathi-Frontend/scripts/backup-db-atlas.sh --source-uri "mongodb+srv://..."`

- View options:
  - `./sanghathi-Frontend/scripts/backup-db-atlas.sh --help`

Backup output is written to:
- `database-backups/<db-name>-<timestamp>/`
- Includes per-collection `.jsonl` exports and `schema-summary.json` for structure review.

## Notes

- Backend command used: `npm test -- --runInBand`
- Frontend command used: `npm test`
- Ensure dependencies are installed in both projects before running scripts.
