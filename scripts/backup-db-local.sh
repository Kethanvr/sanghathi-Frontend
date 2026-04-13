#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ "${1:-}" != "--no-local-sync" ]]; then
  "$ROOT_DIR/sanghathi-Frontend/scripts/start-local-mongo.sh"
fi

cd "$ROOT_DIR/sanghathi-Backend"

if [[ "${1:-}" == "--no-local-sync" ]]; then
  node scripts/local-db-backup.mjs --no-local-sync "${@:2}"
else
  LOCAL_MONGODB_URI="${LOCAL_MONGODB_URI:-mongodb://127.0.0.1:27018}" \
    node scripts/local-db-backup.mjs "$@"
fi
