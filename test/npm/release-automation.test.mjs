import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	chmodSync,
	cpSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const REPOSITORY_ROOT = fileURLToPath(new URL("../..", import.meta.url));
const RELEASE_EXAMPLE = path.join(REPOSITORY_ROOT, ".github/workflows/release.yml.example");
const DEFAULT_ACCOUNT = "release-owner";
const DEFAULT_PACKAGE = "@example/tool";
const DEFAULT_VERSION = "1.2.3";
const DEFAULT_REPOSITORY = "example/tool";
const DEFAULT_WORKFLOW = "release.yml";
const DEFAULT_ENVIRONMENT = "npm-release";
const DEFAULT_REVIEWER = "release-owner";
const DEFAULT_TAG_PATTERN = "v*";
const TEST_PREFIX = "pi-extension-release-test-";
const SECRET_MARKER = "secret-auth-marker";
const GITHUB_REVIEWER_ID = 123;
const GITHUB_ADMIN_ROLE_ID = 5;
const RULESET_NAME = "release-tags-admin-only";
const ACTIONS = {
	bootstrap: "bootstrap-publish",
	github: "setup-github-release",
	trust: "configure-trust",
	harden: "harden-publishing",
};
const SCRIPT_PATHS = {
	preflight: path.join(REPOSITORY_ROOT, "scripts/npm/preflight.sh"),
	bootstrap: path.join(REPOSITORY_ROOT, "scripts/npm/bootstrap-publish.sh"),
	github: path.join(REPOSITORY_ROOT, "scripts/npm/setup-github-release.sh"),
	trust: path.join(REPOSITORY_ROOT, "scripts/npm/configure-trust.sh"),
	harden: path.join(REPOSITORY_ROOT, "scripts/npm/harden-publishing.sh"),
	verify: path.join(REPOSITORY_ROOT, "scripts/npm/verify.sh"),
};

const FAKE_NPM = `#!/usr/bin/env node
const fs = require("node:fs");
const path = require("node:path");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.CALLS_FILE, JSON.stringify({ tool: "npm", args }) + "\\n");
const fail = (status, text) => { process.stderr.write(text + "\\n"); process.exit(status); };
if (process.env.FAKE_FAIL_COMMAND === args[0]) fail(Number(process.env.FAKE_FAIL_STATUS ?? 23), process.env.SECRET_MARKER);
switch (args[0]) {
  case "--version":
    process.stdout.write((process.env.FAKE_NPM_VERSION ?? "11.15.0") + "\\n");
    break;
  case "whoami":
    process.stdout.write((process.env.FAKE_NPM_ACCOUNT ?? process.env.NPM_ACCOUNT) + "\\n");
    break;
  case "view":
    if (args[1] === process.env.PKG_NAME && args[2] === "name") {
      const mode = process.env.FAKE_VIEW_MODE ?? "absent";
      if (mode === "absent") fail(1, "npm error code E404");
      if (mode === "exists") process.stdout.write(JSON.stringify(process.env.PKG_NAME) + "\\n");
      if (mode === "unknown") fail(7, "network failure");
    } else {
      process.stdout.write((process.env.FAKE_METADATA_JSON ?? JSON.stringify({
        name: process.env.PKG_NAME,
        version: process.env.PKG_VERSION,
        repository: { url: "git+https://github.com/" + process.env.REPO + ".git" },
        dist: { integrity: "sha512-synthetic", shasum: "0123456789abcdef" },
      })) + "\\n");
    }
    break;
  case "pack": {
    const destination = args[args.indexOf("--pack-destination") + 1];
    fs.mkdirSync(destination, { recursive: true });
    fs.writeFileSync(path.join(destination, "example-tool-1.2.3.tgz"), "synthetic-package");
    process.stdout.write("example-tool-1.2.3.tgz\\n");
    break;
  }
  case "publish":
    if (!args.includes("--dry-run")) process.stdout.write("interactive-publish\\n");
    break;
  case "access":
    if (args[1] === "get") process.stdout.write((process.env.FAKE_ACCESS_JSON ?? JSON.stringify({ [process.env.PKG_NAME]: "public" })) + "\\n");
    break;
  case "trust":
    if (args[1] === "list") process.stdout.write((process.env.FAKE_TRUST_JSON ?? JSON.stringify([{
      type: "github",
      file: process.env.WORKFLOW_FILE,
      repository: process.env.REPO,
      environment: process.env.ENVIRONMENT,
      permissions: ["createPackage"],
    }])) + "\\n");
    break;
}
`;

const FAKE_GH = `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
const input = fs.readFileSync(0, "utf8");
fs.appendFileSync(process.env.CALLS_FILE, JSON.stringify({ tool: "gh", args, input }) + "\\n");
if (process.env.FAKE_FAIL_COMMAND === "gh") process.exit(Number(process.env.FAKE_FAIL_STATUS ?? 29));
if (args[0] === "auth") process.exit(0);
const endpoint = args[1] ?? "";
if (endpoint === "users/" + process.env.REVIEWER) process.stdout.write("123\\n");
else if (endpoint.endsWith("deployment-branch-policies") && !args.includes("-X")) {
  process.stdout.write(process.env.FAKE_POLICY_JSON ?? JSON.stringify({ branch_policies: [{ name: process.env.TAG_PATTERN, type: "tag" }] }));
} else if (endpoint.endsWith("rulesets") && args.includes("--jq")) {
  process.stdout.write("456\\n");
} else if (endpoint === "repos/" + process.env.REPO + "/rulesets/456") {
  process.stdout.write(process.env.FAKE_RULESET_JSON ?? JSON.stringify({ id: 456, name: "release-tags-admin-only", source_type: "Repository", target: "tag", enforcement: "active", conditions: { ref_name: { include: ["refs/tags/" + process.env.TAG_PATTERN], exclude: [] } }, rules: [{ type: "creation" }, { type: "update" }, { type: "deletion" }], bypass_actors: [{ actor_id: 5, actor_type: "RepositoryRole", bypass_mode: "always" }] }));
} else if (endpoint.endsWith("rulesets") && !args.includes("-X")) {
  process.stdout.write("[]");
} else if (endpoint.includes("/environments/") && !endpoint.endsWith("deployment-branch-policies") && !args.includes("-X")) {
  process.stdout.write(process.env.FAKE_ENVIRONMENT_JSON ?? JSON.stringify({ can_admins_bypass: false, reviewers: [{ type: "User", reviewer: { login: process.env.REVIEWER, id: 123 } }], deployment_branch_policy: { protected_branches: false, custom_branch_policies: true } }));
}
`;

const FAKE_GIT = `#!/usr/bin/env node
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.CALLS_FILE, JSON.stringify({ tool: "git", args }) + "\\n");
if (args[0] === "status") process.stdout.write(process.env.FAKE_GIT_STATUS ?? "");
`;

const FAKE_SMOKE = `import { appendFileSync, existsSync } from "node:fs";
import path from "node:path";
const args = process.argv.slice(2);
appendFileSync(process.env.CALLS_FILE, JSON.stringify({ tool: "smoke", args }) + "\\n");
if (args[0] !== "--tarball" || !path.isAbsolute(args[1] ?? "") || !existsSync(args[1])) process.exit(9);
`;

function writeExecutable(filePath, content) {
	writeFileSync(filePath, content);
	chmodSync(filePath, 0o755);
}

function createFixture() {
	const root = mkdtempSync(path.join(tmpdir(), TEST_PREFIX));
	const project = path.join(root, "project");
	const fakeBin = path.join(root, "bin");
	const callsFile = path.join(root, "calls.jsonl");
	mkdirSync(path.join(project, ".github", "workflows"), { recursive: true });
	mkdirSync(path.join(project, "scripts"), { recursive: true });
	mkdirSync(fakeBin, { recursive: true });
	writeFileSync(callsFile, "");
	writeFileSync(
		path.join(project, "package.json"),
		JSON.stringify({
			name: DEFAULT_PACKAGE,
			version: DEFAULT_VERSION,
			repository: { type: "git", url: `git+https://github.com/${DEFAULT_REPOSITORY}.git` },
			publishConfig: { access: "public" },
		}),
	);
	cpSync(RELEASE_EXAMPLE, path.join(project, ".github", "workflows", DEFAULT_WORKFLOW));
	writeFileSync(path.join(project, "scripts", "smoke-package.mjs"), FAKE_SMOKE);
	writeExecutable(path.join(fakeBin, "npm"), FAKE_NPM);
	writeExecutable(path.join(fakeBin, "gh"), FAKE_GH);
	writeExecutable(path.join(fakeBin, "git"), FAKE_GIT);
	return { root, project, fakeBin, callsFile };
}

function runScript(fixture, scriptPath, overrides = {}) {
	return spawnSync("/bin/bash", [scriptPath], {
		cwd: fixture.project,
		env: {
			PATH: `${fixture.fakeBin}${path.delimiter}${path.dirname(process.execPath)}${path.delimiter}/usr/bin:/bin:/usr/sbin:/sbin`,
			HOME: path.join(fixture.root, "home"),
			TMPDIR: fixture.root,
			CALLS_FILE: fixture.callsFile,
			SECRET_MARKER,
			NODE_BIN: process.execPath,
			NPM_BIN: "npm",
			GH_BIN: "gh",
			GIT_BIN: "git",
			NPM_ACCOUNT: DEFAULT_ACCOUNT,
			PKG_NAME: DEFAULT_PACKAGE,
			PKG_VERSION: DEFAULT_VERSION,
			REPO: DEFAULT_REPOSITORY,
			WORKFLOW_FILE: DEFAULT_WORKFLOW,
			ENVIRONMENT: DEFAULT_ENVIRONMENT,
			REVIEWER: DEFAULT_REVIEWER,
			TAG_PATTERN: DEFAULT_TAG_PATTERN,
			DRY_RUN: "0",
			...overrides,
		},
		encoding: "utf8",
	});
}

function calls(fixture) {
	const text = readFileSync(fixture.callsFile, "utf8").trim();
	return text === "" ? [] : text.split("\n").map((line) => JSON.parse(line));
}

function withFixture(run) {
	const fixture = createFixture();
	try {
		run(fixture);
	} finally {
		rmSync(fixture.root, { recursive: true, force: true });
	}
}

test("preflight requires the exact npm account", () => {
	withFixture((fixture) => {
		const accepted = runScript(fixture, SCRIPT_PATHS.preflight);
		assert.equal(accepted.status, 0, accepted.stderr);
		assert.match(accepted.stdout, /preflight passed/u);
		assert.equal(
			calls(fixture).some((call) => call.tool === "npm" && call.args[0] === "whoami"),
			true,
		);

		writeFileSync(fixture.callsFile, "");
		const rejected = runScript(fixture, SCRIPT_PATHS.preflight, {
			FAKE_NPM_ACCOUNT: "other-owner",
		});
		assert.notEqual(rejected.status, 0);
		assert.match(rejected.stderr, /NPM_ACCOUNT/u);
		assert.equal(
			calls(fixture).some((call) => call.tool === "npm" && call.args[0] === "view"),
			false,
		);
	});
});

test("bootstrap packs once and dry-runs then publishes the same absolute tarball", () => {
	withFixture((fixture) => {
		const result = runScript(fixture, SCRIPT_PATHS.bootstrap, { CONFIRM: ACTIONS.bootstrap });
		assert.equal(result.status, 0, result.stderr);
		const log = calls(fixture);
		const packCalls = log.filter((call) => call.tool === "npm" && call.args[0] === "pack");
		const publishCalls = log.filter((call) => call.tool === "npm" && call.args[0] === "publish");
		const smokeCalls = log.filter((call) => call.tool === "smoke");
		assert.equal(packCalls.length, 1);
		assert.equal(packCalls[0].args.includes("--ignore-scripts"), false);
		assert.equal(smokeCalls.length, 1);
		assert.equal(publishCalls.length, 2);
		const tarballs = publishCalls.map((call) => call.args[1]);
		assert.equal(path.isAbsolute(tarballs[0]), true);
		assert.equal(tarballs[0], tarballs[1]);
		assert.equal(smokeCalls[0].args[1], tarballs[0]);
		assert.equal(publishCalls[0].args.includes("--dry-run"), true);
		assert.equal(publishCalls[1].args.includes("--dry-run"), false);
		assert.match(result.stdout, /interactive-publish/u);
		const whoamiIndex = log.findIndex((call) => call.tool === "npm" && call.args[0] === "whoami");
		const viewIndex = log.findIndex((call) => call.tool === "npm" && call.args[0] === "view");
		assert.ok(whoamiIndex >= 0 && whoamiIndex < viewIndex);
	});
});

test("bootstrap preview never performs the final publish", () => {
	withFixture((fixture) => {
		const result = runScript(fixture, SCRIPT_PATHS.bootstrap, { DRY_RUN: "1" });
		assert.equal(result.status, 0, result.stderr);
		const publishCalls = calls(fixture).filter(
			(call) => call.tool === "npm" && call.args[0] === "publish",
		);
		assert.equal(publishCalls.length, 1);
		assert.equal(publishCalls[0].args.includes("--dry-run"), true);
		assert.match(result.stdout, /dry-run: npm publish/u);
	});
});

test("bootstrap rejects unsafe state before packing", () => {
	for (const overrides of [
		{ CONFIRM: ACTIONS.bootstrap, FAKE_NPM_ACCOUNT: "other-owner" },
		{ CONFIRM: ACTIONS.bootstrap, FAKE_VIEW_MODE: "unknown" },
		{ CONFIRM: ACTIONS.bootstrap, FAKE_VIEW_MODE: "exists" },
	]) {
		withFixture((fixture) => {
			const result = runScript(fixture, SCRIPT_PATHS.bootstrap, overrides);
			assert.notEqual(result.status, 0);
			assert.equal(
				calls(fixture).some((call) => call.tool === "npm" && call.args[0] === "pack"),
				false,
			);
		});
	}
});

test("GitHub setup previews safely and sends constrained payloads", () => {
	withFixture((fixture) => {
		const preview = runScript(fixture, SCRIPT_PATHS.github, { DRY_RUN: "1" });
		assert.equal(preview.status, 0, preview.stderr);
		assert.equal(
			calls(fixture).some((call) => call.tool === "gh" && call.args.includes("-X")),
			false,
		);
		assert.match(preview.stdout, /dry-run: gh api/u);

		writeFileSync(fixture.callsFile, "");
		const applied = runScript(fixture, SCRIPT_PATHS.github, { CONFIRM: ACTIONS.github });
		assert.equal(applied.status, 0, applied.stderr);
		const mutations = calls(fixture).filter(
			(call) => call.tool === "gh" && call.args.includes("-X"),
		);
		const environment = mutations.find((call) => call.args.includes("PUT"));
		const ruleset = mutations.find((call) =>
			call.args.some((argument) => argument.endsWith("/rulesets/456")),
		);
		assert.deepEqual(JSON.parse(environment.input), {
			can_admins_bypass: false,
			reviewers: [{ type: "User", id: GITHUB_REVIEWER_ID }],
			deployment_branch_policy: { protected_branches: false, custom_branch_policies: true },
		});
		assert.deepEqual(JSON.parse(ruleset.input), {
			name: RULESET_NAME,
			target: "tag",
			enforcement: "active",
			conditions: { ref_name: { include: [`refs/tags/${DEFAULT_TAG_PATTERN}`], exclude: [] } },
			rules: [{ type: "creation" }, { type: "update" }, { type: "deletion" }],
			bypass_actors: [
				{ actor_id: GITHUB_ADMIN_ROLE_ID, actor_type: "RepositoryRole", bypass_mode: "always" },
			],
		});
	});
});

test("npm trust and hardening require action-specific confirmation", () => {
	withFixture((fixture) => {
		const cases = [
			[
				SCRIPT_PATHS.trust,
				ACTIONS.trust,
				[
					"trust",
					"github",
					DEFAULT_PACKAGE,
					"--file",
					DEFAULT_WORKFLOW,
					"--repo",
					DEFAULT_REPOSITORY,
					"--env",
					DEFAULT_ENVIRONMENT,
					"--allow-publish",
					"--yes",
				],
			],
			[SCRIPT_PATHS.harden, ACTIONS.harden, ["access", "set", "mfa=publish", DEFAULT_PACKAGE]],
		];
		for (const [script, action, expected] of cases) {
			const rejected = runScript(fixture, script);
			assert.notEqual(rejected.status, 0);
			const accepted = runScript(fixture, script, { CONFIRM: action });
			assert.equal(accepted.status, 0, accepted.stderr);
			assert.equal(
				calls(fixture).some(
					(call) => call.tool === "npm" && JSON.stringify(call.args) === JSON.stringify(expected),
				),
				true,
			);
		}
	});
});

test("verification is read-only and checks npm plus GitHub state", () => {
	withFixture((fixture) => {
		const result = runScript(fixture, SCRIPT_PATHS.verify);
		assert.equal(result.status, 0, result.stderr);
		assert.match(result.stdout, /verification passed/u);
		for (const call of calls(fixture)) {
			if (call.tool === "npm") {
				const mutates =
					["publish", "pack"].includes(call.args[0]) ||
					(call.args[0] === "trust" && call.args[1] === "github") ||
					(call.args[0] === "access" && call.args[1] === "set");
				assert.equal(mutates, false);
			}
			if (call.tool === "gh") assert.equal(call.args.includes("-X"), false);
		}
	});
});

test("preflight rejects a workflow that rebuilds inside publish", () => {
	withFixture((fixture) => {
		const workflowPath = path.join(fixture.project, ".github", "workflows", DEFAULT_WORKFLOW);
		writeFileSync(
			workflowPath,
			readFileSync(workflowPath, "utf8").replace(
				"          npm publish",
				"          npm pack\\n          npm publish",
			),
		);
		const result = runScript(fixture, SCRIPT_PATHS.preflight);
		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /publish/u);
	});
});

test("release example is inert and moves one artifact to publication", () => {
	const workflow = readFileSync(RELEASE_EXAMPLE, "utf8");
	const publishStart = workflow.indexOf("  publish:\n");
	assert.notEqual(publishStart, -1);
	const publishJob = workflow.slice(publishStart);
	assert.equal(workflow.match(/npm pack --pack-destination artifact/gu)?.length, 1);
	assert.match(workflow, /actions\/upload-artifact@[a-f0-9]{40}/u);
	assert.match(workflow, /node scripts\/smoke-package\.mjs --tarball "\$package"/u);
	assert.match(publishJob, /needs: \[package, verify\]/u);
	assert.match(publishJob, /actions\/download-artifact@[a-f0-9]{40}/u);
	assert.match(publishJob, /npm publish "\$package" --provenance --access public/u);
	assert.doesNotMatch(publishJob, /npm pack|npm run|NPM_TOKEN|NODE_AUTH_TOKEN|secrets\./u);
});

test("release docs expose every input and guarded command", () => {
	const setup = readFileSync(path.join(REPOSITORY_ROOT, "docs/npm-release-setup.md"), "utf8");
	const release = readFileSync(path.join(REPOSITORY_ROOT, "RELEASE.md"), "utf8");
	const inputs = [
		"NPM_ACCOUNT",
		"PKG_NAME",
		"PKG_VERSION",
		"REPO",
		"WORKFLOW_FILE",
		"ENVIRONMENT",
		"REVIEWER",
		"TAG_PATTERN",
	];
	for (const name of inputs) assert.match(setup, new RegExp(name, "u"));
	for (const action of Object.values(ACTIONS))
		assert.match(`${setup}\n${release}`, new RegExp(`CONFIRM=${action}`, "u"));
	assert.match(setup, /## 2[\s\S]*scripts\/npm\/setup-github-release\.sh[\s\S]*UI fallback/u);
	assert.match(setup, /## 3[\s\S]*scripts\/npm\/configure-trust\.sh[\s\S]*UI fallback/u);
	assert.match(
		setup,
		/Manual interaction is limited to npm login, passkey or two-factor authentication challenges, and release approvals\./u,
	);
	assert.match(release, /packs once/u);
	assert.match(release, /same absolute tarball/u);
});
