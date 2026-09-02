#!/usr/bin/env bash
# Local project checks prevent registry identity drift and dirty-source publication.

require_workflow() {
	local workflow_file="$1"
	[ -f ".github/workflows/${workflow_file}" ] || fail 'configured workflow file does not exist'
}

require_smoke_script() {
	[ -f 'scripts/smoke-package.mjs' ] || fail 'scripts/smoke-package.mjs does not exist'
}

require_clean_worktree() {
	local status_output
	if status_output="$("${GIT_BIN}" status --porcelain --untracked-files=all 2>/dev/null)"; then
		[ -z "${status_output}" ] || fail 'working tree must be clean'
	else
		local status=$?
		printf 'error: unable to inspect working tree\n' >&2
		return "${status}"
	fi
}

require_npm_identity() {
	local expected_account="$1"
	local actual_account
	if actual_account="$("${NPM_BIN}" whoami --registry "${NPM_REGISTRY}" 2>/dev/null)"; then
		:
	else
		local status=$?
		printf 'error: npm authentication check failed\n' >&2
		return "${status}"
	fi
	[ "${actual_account}" = "${expected_account}" ] || fail 'npm whoami must match NPM_ACCOUNT exactly'
}

validate_package_metadata() {
	local package_name="$1"
	local package_version="$2"
	local repository="$3"
	"${NODE_BIN}" --input-type=module - "${package_name}" "${package_version}" "${repository}" <<'NODE'
import fs from "node:fs";

const [expectedName, expectedVersion, expectedRepository] = process.argv.slice(2);
const reject = (message) => {
  console.error(`error: ${message}`);
  process.exit(1);
};
let metadata;
try {
  metadata = JSON.parse(fs.readFileSync("package.json", "utf8"));
} catch {
  reject("package.json must contain valid JSON");
}
const repositoryUrl = typeof metadata.repository === "string" ? metadata.repository : metadata.repository?.url;
const acceptedRepositories = new Set([
  `git+https://github.com/${expectedRepository}.git`,
  `https://github.com/${expectedRepository}.git`,
  `https://github.com/${expectedRepository}`,
  `git@github.com:${expectedRepository}.git`,
]);

if (metadata.name !== expectedName) reject("package.json name does not match PKG_NAME");
if (metadata.version !== expectedVersion) reject("package.json version does not match PKG_VERSION");
if (metadata.private === true) reject("package.json marks the package private");
if (!/^[0-9]+\.[0-9]+\.[0-9]+(?:[+-][0-9A-Za-z.-]+)?$/.test(metadata.version ?? "")) {
  reject("package.json version must be semantic");
}
if (!acceptedRepositories.has(repositoryUrl)) reject("package.json repository does not match REPO");
if (metadata.publishConfig?.access !== "public") reject("publishConfig.access must be public");
NODE
}

prove_package_absent() {
	local package_name="$1"
	local registry_error
	registry_error="$(mktemp)"
	if "${NPM_BIN}" view "${package_name}" name --json --registry "${NPM_REGISTRY}" >/dev/null 2>"${registry_error}"; then
		rm -f -- "${registry_error}"
		fail 'package already exists; bootstrap publish is not allowed'
	else
		local status=$?
		if [ "${status}" -ne 1 ] || ! grep -Eq '(^|[[:space:]])E404($|[[:space:]])' "${registry_error}"; then
			rm -f -- "${registry_error}"
			printf 'error: unable to prove package absence\n' >&2
			return "${status}"
		fi
	fi
	rm -f -- "${registry_error}"
}
