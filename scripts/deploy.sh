#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required. Install Docker Engine or Docker Desktop first." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running or is not accessible." >&2
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  echo "Docker Compose is required." >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env. Edit PROBLEM_DATA_DIR to mount your private problem catalog."
fi

"${COMPOSE[@]}" up -d --build

port="$(awk -F= '$1 == "LOCALCODE_PORT" { print $2 }' .env | tail -n 1)"
port="${port:-8787}"
health_url="http://127.0.0.1:${port}/api/health"

for _ in $(seq 1 90); do
  if command -v curl >/dev/null 2>&1 && curl -fsS "$health_url" >/dev/null 2>&1; then
    echo "LocalCode is ready at http://127.0.0.1:${port}"
    exit 0
  fi
  sleep 2
done

echo "Container started but health check did not pass. Inspect logs with:" >&2
echo "  ${COMPOSE[*]} logs --tail=200 localcode" >&2
exit 1
