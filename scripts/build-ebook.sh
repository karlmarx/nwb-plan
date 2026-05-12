#!/usr/bin/env bash
# Build the NWB-plan ebook end-to-end: snapshots → JSON → ePub → PDF.
#
# Local usage:
#   bash scripts/build-ebook.sh
#
# CI usage: same, after `npm ci`, `apt-get install ... libcairo2 calibre`,
# and `npx playwright install --with-deps chromium`.
#
# Outputs (under dist/):
#   dist/plan.json              – flattened plan data
#   dist/diagrams/*.svg         – per-exercise static SVG snapshots
#   dist/nwb-plan.epub          – ePub3 ebook
#   dist/nwb-plan.pdf           – PDF rendition (Calibre ebook-convert)

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DIST="$ROOT/dist"
PORT="${PORT:-3737}"
BASE_URL="http://127.0.0.1:${PORT}"
SERVER_PID=""

cleanup() {
  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "[build-ebook] stopping Next server (pid $SERVER_PID)"
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

mkdir -p "$DIST" "$DIST/diagrams"

echo "[build-ebook] step 1/5 — exporting plan.json"
npx tsx scripts/export-plan.ts --out "$DIST/plan.json"

echo "[build-ebook] step 2/5 — building Next so we can serve the snapshot route"
npm run build >/dev/null

echo "[build-ebook] step 3/5 — starting Next server on port $PORT"
PORT="$PORT" npx next start -p "$PORT" >"$DIST/.next-server.log" 2>&1 &
SERVER_PID=$!

# Wait for the server to answer. Cap at ~60s so a wedged build fails loudly.
for i in $(seq 1 60); do
  if curl -fsS "$BASE_URL" >/dev/null 2>&1; then
    echo "[build-ebook] Next ready after ${i}s"
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "[build-ebook] Next server exited early — see $DIST/.next-server.log" >&2
    exit 1
  fi
  sleep 1
done

if ! curl -fsS "$BASE_URL" >/dev/null 2>&1; then
  echo "[build-ebook] Next never became ready — see $DIST/.next-server.log" >&2
  exit 1
fi

echo "[build-ebook] step 4/5 — snapshotting diagrams"
uv run scripts/snapshot_diagrams.py \
  --base-url "$BASE_URL" \
  --out "$DIST/diagrams"

echo "[build-ebook] step 5/5 — generating ePub"
uv run scripts/nwb_to_epub.py \
  "$DIST/plan.json" \
  --out "$DIST/nwb-plan.epub" \
  --asset-root "$DIST"

if command -v ebook-convert >/dev/null 2>&1; then
  echo "[build-ebook] generating PDF via ebook-convert"
  ebook-convert "$DIST/nwb-plan.epub" "$DIST/nwb-plan.pdf" \
    --pdf-page-numbers \
    --paper-size letter \
    >"$DIST/.ebook-convert.log" 2>&1
else
  echo "[build-ebook] WARNING: ebook-convert not found — skipping PDF" >&2
fi

echo "[build-ebook] done:"
ls -lh "$DIST"/nwb-plan.* 2>/dev/null || true
