#!/usr/bin/env bash
# SessionStart hook for Claude Code.
#
# Two jobs:
#   1. Make sure the working copy is fresh. Specifically, fetch origin
#      and surface how many commits this branch is behind origin/main
#      so the agent (and the user) see the divergence immediately
#      instead of building on stale code and discovering it at push.
#   2. Install npm dependencies so tsc / build / adapter scripts work
#      without a separate `npm ci` step mid-session.
#
# Output goes to stdout, which Claude Code surfaces to the model as
# session context. Keep it short and skim-friendly.

set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

print_status() {
  echo "== session-start =="
  echo "branch:   $(git rev-parse --abbrev-ref HEAD)"
  echo "head:     $(git rev-parse --short HEAD)"
}

freshness_check() {
  # Fetch quietly with a hard cap so we don't block session start on a
  # hung remote. If fetch fails (offline, etc.) we just warn and move on.
  if ! timeout 20s git fetch --quiet origin 2>/dev/null; then
    echo "fetch:    SKIPPED (no network or fetch timed out)"
    return 0
  fi
  echo "fetch:    ok"

  # Pick a default upstream to compare against. Most PRs target main.
  local base="origin/main"
  if ! git rev-parse --verify --quiet "$base" >/dev/null; then
    base="origin/dev"
    git rev-parse --verify --quiet "$base" >/dev/null || return 0
  fi

  # Left/right counts: behind = on base but not HEAD; ahead = vice versa.
  read -r behind ahead < <(git rev-list --left-right --count "$base"...HEAD)
  echo "vs $base: behind=$behind ahead=$ahead"

  if [ "$behind" -gt 0 ]; then
    echo ""
    echo "!! WORKING BRANCH IS BEHIND $base BY $behind COMMIT(S)."
    echo "!! Rebase before writing new code, or you will push stale work."
    echo "!! Suggested:  git rebase $base"
    echo ""
    echo "Missing commits:"
    git log --oneline HEAD.."$base" | head -10 | sed 's/^/  /'
  fi
}

install_deps() {
  # `npm install` is faster than `npm ci` for re-runs because it uses the
  # cached node_modules. CI still uses `npm ci` for strict reproducibility.
  if [ -f package-lock.json ]; then
    echo "npm:      installing..."
    npm install --no-audit --no-fund --silent >/dev/null 2>&1 || {
      echo "npm:      FAILED (rerun manually: npm install)"
      return 0
    }
    echo "npm:      ok"
  fi
}

print_status
freshness_check
install_deps
echo "== ready =="
