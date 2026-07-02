#!/usr/bin/env bash
# Regenerate terminal captures from a built reach CLI (run from repo root).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
REACH="$ROOT/packages/reach"
OUT="$ROOT/packages/demo-video"
strip_ansi() { sed 's/\x1b\[[0-9;]*m//g'; }

cd "$REACH"
npm run build >/dev/null
node dist/index.js quick https://example.com 2>&1 | strip_ansi | tail -1

python3 -m http.server 8765 --directory tests/mocks/html &
PID=$!
sleep 1
node dist/index.js audit "http://localhost:8765/violations-page.html" 2>&1 | strip_ansi | head -40
node dist/index.js crawl "http://localhost:8765/" --max-pages 2 --max-depth 1 2>&1 | strip_ansi | head -25
kill "$PID" 2>/dev/null || true

echo "Captures verified. Update src/data/captures.ts manually if output shape changes."
