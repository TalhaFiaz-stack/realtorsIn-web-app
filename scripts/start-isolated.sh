#!/usr/bin/env bash
# Serve an existing isolated production build from `.next-build`.
# Does NOT rebuild. Run `npm run build:isolated` first.
#
# Usage:
#   npm run start:isolated
#   PORT=3003 npm run start:isolated
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DIST=".next-build"
PORT="${PORT:-3002}"

if [[ ! -d "$DIST" ]]; then
  echo "Missing ${DIST}. Build first: npm run build:isolated" >&2
  exit 1
fi

if [[ ! -f "$DIST/BUILD_ID" ]]; then
  echo "${DIST} looks incomplete (no BUILD_ID). Rebuild: npm run build:isolated" >&2
  exit 1
fi

echo "Starting isolated production server from ${DIST} on port ${PORT}…"
echo "Dev command (npm run dev) and default start (npm run start) are unchanged."
NEXT_DIST_DIR="$DIST" npx next start -p "$PORT"
