#!/usr/bin/env bash
# Bootstrap is destructive only after identity, absence, and exact bytes are proven.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_DIR
# shellcheck source=scripts/npm/lib.sh
source "${SCRIPT_DIR}/lib.sh"

readonly ACTION='bootstrap-publish'
readonly NPM_ACCOUNT="${NPM_ACCOUNT:-}"
readonly PKG_NAME="${PKG_NAME:-}"
readonly PKG_VERSION="${PKG_VERSION:-}"
readonly REPO="${REPO:-}"

validate_npm_account "${NPM_ACCOUNT}"
validate_package_name "${PKG_NAME}"
validate_version "${PKG_VERSION}"
validate_repository "${REPO}"
require_confirmation "${ACTION}"
require_command "${NPM_BIN}"
require_command "${GIT_BIN}"
require_command "${NODE_BIN}"
require_npm_version
validate_package_metadata "${PKG_NAME}" "${PKG_VERSION}" "${REPO}"
require_clean_worktree
require_npm_identity "${NPM_ACCOUNT}"
prove_package_absent "${PKG_NAME}"
require_smoke_script

artifact_directory="$(mktemp -d)"
readonly artifact_directory
trap 'rm -rf -- "${artifact_directory}"' EXIT
if "${NPM_BIN}" pack --pack-destination "${artifact_directory}" >/dev/null 2>&1; then
	:
else
	status=$?
	printf 'error: npm pack failed\n' >&2
	exit "${status}"
fi

archives=("${artifact_directory}"/*.tgz)
[ "${#archives[@]}" -eq 1 ] && [ -f "${archives[0]}" ] || fail 'npm pack must create exactly one tarball'
readonly tarball="${archives[0]}"
case "${tarball}" in
	/*) ;;
	*) fail 'npm pack tarball path must be absolute' ;;
esac

"${NODE_BIN}" scripts/smoke-package.mjs --tarball "${tarball}"
if "${NPM_BIN}" publish "${tarball}" --dry-run --access public --registry "${NPM_REGISTRY}" >/dev/null 2>&1; then
	:
else
	status=$?
	printf 'error: npm publish dry-run failed\n' >&2
	exit "${status}"
fi

printf 'target package: %s\n' "${PKG_NAME}"
run_interactive_mutation "${ACTION}" "${NPM_BIN}" publish "${tarball}" --access public --registry "${NPM_REGISTRY}"
printf 'bootstrap publish completed\n'
