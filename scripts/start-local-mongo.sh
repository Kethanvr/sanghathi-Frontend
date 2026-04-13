#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
CONTAINER_NAME="sanghathi-mongo-local"
PORT="27018"
IMAGE="mongo:7"
DATA_DIR="$ROOT_DIR/.mongo-local-data"

usage() {
  cat <<'USAGE'
Usage: ./sanghathi-Frontend/scripts/start-local-mongo.sh [--status|--stop]

Options:
  --status   Show local MongoDB container status
  --stop     Stop local MongoDB container (does not delete data)
  -h, --help Show help
USAGE
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required but not installed."
  exit 1
fi

if [[ "${1:-}" == "--status" ]]; then
  docker ps -a --filter "name=^/${CONTAINER_NAME}$"
  exit 0
fi

if [[ "${1:-}" == "--stop" ]]; then
  if docker ps --filter "name=^/${CONTAINER_NAME}$" --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    docker stop "$CONTAINER_NAME" >/dev/null
    echo "Stopped container: $CONTAINER_NAME"
  else
    echo "Container is not running: $CONTAINER_NAME"
  fi
  exit 0
fi

mkdir -p "$DATA_DIR"

if docker ps --filter "name=^/${CONTAINER_NAME}$" --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "Local MongoDB already running at mongodb://127.0.0.1:${PORT}"
  exit 0
fi

if docker ps -a --filter "name=^/${CONTAINER_NAME}$" --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker start "$CONTAINER_NAME" >/dev/null
else
  docker run -d \
    --name "$CONTAINER_NAME" \
    -p "$PORT:27017" \
    -v "$DATA_DIR:/data/db" \
    "$IMAGE" >/dev/null
fi

echo "Started local MongoDB at mongodb://127.0.0.1:${PORT}"
