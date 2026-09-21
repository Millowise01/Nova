#!/usr/bin/env bash
# Decides which workspace packages CI runs lint, typecheck, test and build for, and says so
# explicitly. Writes `mode` and `args` to $GITHUB_OUTPUT (stdout when run locally) and a
# short report to $GITHUB_STEP_SUMMARY.
#
#   mode=all       run everything (no turbo filter)
#   mode=filtered  run only packages affected since the base (`args` is the turbo filter)
#   mode=none      nothing is affected; later steps are skipped, visibly, not silently
#
# Inputs (environment): EVENT_NAME (github.event_name), PUSH_BEFORE (github.event.before).
# The base is the commit the change is measured against:
#   pull_request  first parent of the merge commit CI checks out (the base branch tip)
#   push          the tip before the push, so a multi-commit push is judged as a whole,
#                 not by its last commit alone
#
# It runs EVERYTHING when it cannot be sure a filter is safe: the base is unavailable
# (new branch, force push), or CI/workspace configuration changed. A filter that
# silently selects nothing must never look like a passing run.
set -euo pipefail

OUT="${GITHUB_OUTPUT:-/dev/stdout}"
SUMMARY="${GITHUB_STEP_SUMMARY:-/dev/null}"
EVENT_NAME="${EVENT_NAME:-push}"

if [ "$EVENT_NAME" = "pull_request" ]; then
  BASE="$(git rev-parse HEAD^1 2>/dev/null || true)"
else
  BASE="${PUSH_BEFORE:-}"
fi

mode=filtered
reason=""

if [ -z "$BASE" ] || [ "$BASE" = "0000000000000000000000000000000000000000" ] \
  || ! git cat-file -e "${BASE}^{commit}" 2>/dev/null; then
  mode=all
  reason="the base commit is not available (new branch or force push)"
else
  CHANGED="$(git diff --name-only "$BASE" HEAD)"
  if printf '%s\n' "$CHANGED" | grep -qE '^(\.github/|pnpm-lock\.yaml$|pnpm-workspace\.yaml$|turbo\.json$|package\.json$|tsconfig[^/]*\.json$|eslint\.config\.[^/]*$|prettier\.config\.[^/]*$|\.npmrc$)'; then
    mode=all
    reason="CI or shared workspace configuration changed"
  fi
fi

args=""
packages="(all workspace packages)"

if [ "$mode" = "filtered" ]; then
  FILTER="...[$BASE]"
  # `packages` in the dry run is every package in scope, including ones without a given task.
  packages="$(pnpm exec turbo run build --filter="$FILTER" --dry=json \
    | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{const j=JSON.parse(d);console.log((j.packages||[]).filter(p=>p!=="//").join(" "))})')"
  if [ -z "$packages" ]; then
    mode=none
    reason="no workspace package is affected by this change"
  else
    args="--filter=$FILTER"
    reason="packages affected since ${BASE:0:7}"
  fi
fi

{
  echo "mode=$mode"
  echo "args=$args"
} >> "$OUT"

{
  echo "### CI scope: \`$mode\`"
  echo
  echo "- Base: \`${BASE:-none}\`"
  echo "- Reason: $reason"
  if [ "$mode" = "none" ]; then
    echo "- **No lint, typecheck, test or build steps ran for packages.** This is a deliberate, visible skip, not a passing run of those checks."
  else
    echo "- Packages: $packages"
  fi
} >> "$SUMMARY"

echo "scope: mode=$mode ($reason)" >&2
echo "packages: $packages" >&2
