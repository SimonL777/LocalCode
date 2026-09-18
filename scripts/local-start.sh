#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

for command in node npm java javac python3 tar; do
  if ! command -v "$command" >/dev/null 2>&1; then
    echo "Missing required command: $command" >&2
    exit 1
  fi
done

node -e "const [major,minor]=process.versions.node.split('.').map(Number); if(major<22||(major===22&&minor<5)){console.error('Node.js 22.5 or newer is required.');process.exit(1)}"

npm ci
npm run setup:intelligence
npm test
npm run build

echo "Starting LocalCode at http://127.0.0.1:${PORT:-8787}"
exec npm start
