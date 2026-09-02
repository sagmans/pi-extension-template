#!/usr/bin/env bash
# Fail closed before the one-time npm and GitHub setup begins.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
# shellcheck source=scripts/npm/lib.sh
source "${SCRIPT_DIR}/lib.sh"

readonly NPM_ACCOUNT="${NPM_ACCOUNT:-}"
readonly PKG_NAME="${PKG_NAME:-}"
readonly PKG_VERSION="${PKG_VERSION:-}"
readonly REPO="${REPO:-}"
readonly WORKFLOW_FILE="${WORKFLOW_FILE:-}"
readonly ENVIRONMENT="${ENVIRONMENT:-}"
readonly REVIEWER="${REVIEWER:-}"
readonly TAG_PATTERN="${TAG_PATTERN:-}"

validate_npm_account "${NPM_ACCOUNT}"
validate_package_name "${PKG_NAME}"
validate_version "${PKG_VERSION}"
validate_repository "${REPO}"
validate_workflow_file "${WORKFLOW_FILE}"
validate_environment "${ENVIRONMENT}"
validate_reviewer "${REVIEWER}"
validate_tag_pattern "${TAG_PATTERN}"
require_command "${NPM_BIN}"
require_command "${GH_BIN}"
require_command "${GIT_BIN}"
require_command "${NODE_BIN}"
require_npm_version
validate_package_metadata "${PKG_NAME}" "${PKG_VERSION}" "${REPO}"
require_clean_worktree
bash "${SCRIPT_DIR}/validate-workflow.sh" >/dev/null

require_npm_identity "${NPM_ACCOUNT}"
"${GH_BIN}" auth status >/dev/null 2>&1 || fail 'GitHub authentication check failed'

printf 'preflight passed: %s@%s (%s)\n' "${PKG_NAME}" "${PKG_VERSION}" "${REPO}"
