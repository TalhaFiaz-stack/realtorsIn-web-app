#!/usr/bin/env bash
# Isolated production build — avoids corrupting a live Turbopack `.next` folder.
# Usage: from realtorsin-web-app/:  npm run build:isolated
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DIST=".next-build"
rm -rf "$DIST"

echo "Building into ${DIST} (dev server .next left untouched)…"
NEXT_DIST_DIR="$DIST" npx next build --turbopack

echo "Isolated build succeeded → ${DIST}"
echo "To serve without rebuilding: npm run start:isolated"
echo "Custom port: PORT=3003 npm run start:isolated"
echo "Do not run this while relying on concurrent Turbopack HMR against the same DIST_DIR."
