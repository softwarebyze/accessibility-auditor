#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: run-workspace.sh <workspace-path> <script> [script-args...]"
  exit 1
fi

workspace_path="$1"
shift
script_name="$1"
shift

user_agent="${npm_config_user_agent:-}"

if [[ "$user_agent" == bun/* ]] && command -v bun >/dev/null 2>&1; then
  if [[ $# -gt 0 ]]; then
    bun run --cwd "$workspace_path" "$script_name" -- "$@"
  else
    bun run --cwd "$workspace_path" "$script_name"
  fi
else
  if [[ $# -gt 0 ]]; then
    npm run --prefix "$workspace_path" "$script_name" -- "$@"
  else
    npm run --prefix "$workspace_path" "$script_name"
  fi
fi
