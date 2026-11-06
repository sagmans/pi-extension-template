#!/usr/bin/env bash
# Hook entry points must stop rather than select the host's Python from PATH.
set -euo pipefail

UNMANAGED_PATTERN='(^#!.*(env[[:blank:]]+python3|/usr/bin/python3)|^[[:blank:]]*python3[[:blank:]])'
REPOSITORY_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPOSITORY_ROOT"
if matches="$(git grep -n -E "$UNMANAGED_PATTERN" -- scripts .githooks)"; then
  printf 'Python entry points must use uv-managed Python:\n%s\n' "$matches" >&2
  exit 1
else
  status=$?
  if [[ "$status" != 1 ]]; then
    printf 'Cannot inspect the tracked Python entry points (git exit %s)\n' "$status" >&2
    exit "$status"
  fi
fi
printf 'Python entry-point policy passed\n'
