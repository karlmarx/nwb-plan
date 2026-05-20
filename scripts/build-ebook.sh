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

# Per-step wall-clock timing. Writes to stderr (visible in raw CI logs) and
# also to $GITHUB_STEP_SUMMARY when running on Actions, so timings show up on
# the PR check page even if the raw logs are gated behind auth.
SUMMARY_FILE="${GITHUB_STEP_SUMMARY:-/dev/null}"

if [[ "$SUMMARY_FILE" != "/dev/null" ]]; then
  {
    echo "## build-ebook timings"
    echo
    echo "| step | wall time |"
    echo "|---|---|"
  } >> "$SUMMARY_FILE"
fi

phase() {
  local label="$1"; shift
  local slug="${label// /-}"
  slug="${slug//\//-}"
  local logfile="$DIST/.phase-${slug}.log"
  local start end elapsed rc
  : > "$logfile"
  start=$(date +%s)
  echo "[build-ebook] ▶ $label" >&2

  # Run the command, capture combined output to logfile while still streaming
  # to stderr (so it's visible in raw CI logs too). PIPESTATUS[0] gives us
  # the command's exit code, ignoring tee.
  set +e
  ( "$@" ) 2>&1 | tee "$logfile" >&2
  rc=${PIPESTATUS[0]}
  set -e

  end=$(date +%s)
  elapsed=$((end - start))

  if [[ $rc -ne 0 ]]; then
    echo "[build-ebook] ✗ $label FAILED (rc=$rc) after ${elapsed}s" >&2
    if [[ "$SUMMARY_FILE" != "/dev/null" ]]; then
      {
        echo
        echo "### ✗ FAILED: \`$label\` (exit $rc, after ${elapsed}s)"
        echo
        echo '```'
        tail -60 "$logfile"
        echo '```'
      } >> "$SUMMARY_FILE"
    fi
    return $rc
  fi

  echo "[build-ebook] ◀ $label finished in ${elapsed}s" >&2
  if [[ "$SUMMARY_FILE" != "/dev/null" ]]; then
    printf "| %s | %ss |\n" "$label" "$elapsed" >> "$SUMMARY_FILE"
  fi
}

cleanup() {
  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "[build-ebook] stopping Next server (pid $SERVER_PID)"
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

mkdir -p "$DIST" "$DIST/diagrams"

phase "1/5 export plan.json" \
  npx tsx scripts/export-plan.ts --out "$DIST/plan.json"

phase "2/5 next build" \
  bash -c 'npm run build >/dev/null'

start_server() {
  PORT="$PORT" npx next start -p "$PORT" >"$DIST/.next-server.log" 2>&1 &
  SERVER_PID=$!

  for i in $(seq 1 60); do
    if curl -fsS "$BASE_URL" >/dev/null 2>&1; then
      echo "[build-ebook]   server ready after ${i}s" >&2
      return 0
    fi
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
      echo "[build-ebook] Next server exited early — see $DIST/.next-server.log" >&2
      tail -50 "$DIST/.next-server.log" >&2 || true
      return 1
    fi
    sleep 1
  done

  echo "[build-ebook] Next never became ready — see $DIST/.next-server.log" >&2
  tail -50 "$DIST/.next-server.log" >&2 || true
  return 1
}

phase "3/5 next start (warmup)" start_server

phase "4/5 snapshot diagrams" \
  uv run scripts/snapshot_diagrams.py \
  --base-url "$BASE_URL" \
  --out "$DIST/diagrams"

phase "5/5 generate ePub" \
  uv run scripts/nwb_to_epub.py \
  "$DIST/plan.json" \
  --out "$DIST/nwb-plan.epub" \
  --asset-root "$DIST"

if command -v ebook-convert >/dev/null 2>&1; then
  run_ebook_convert() {
    ebook-convert "$DIST/nwb-plan.epub" "$DIST/nwb-plan.pdf" \
      --pdf-page-numbers \
      --paper-size letter \
      >"$DIST/.ebook-convert.log" 2>&1
  }
  phase "6/6 ebook-convert PDF" run_ebook_convert
else
  echo "[build-ebook] WARNING: ebook-convert not found — skipping PDF" >&2
fi

echo "[build-ebook] done:"
ls -lh "$DIST"/nwb-plan.* 2>/dev/null || true
