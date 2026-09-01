import { access, readdir, readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const WORKFLOWS_DIRECTORY = new URL("../.github/workflows/", import.meta.url);
const CI_PATH = new URL("../.github/workflows/ci.yml", import.meta.url);
const RELEASE_EXAMPLE_PATH = new URL("../.github/workflows/release.yml.example", import.meta.url);
const DEPENDABOT_PATH = new URL("../.github/dependabot.yml", import.meta.url);
const COMMUNITY_PATHS = [
	new URL("../.github/pull_request_template.md", import.meta.url),
	new URL("../.github/ISSUE_TEMPLATE/bug_report.yml", import.meta.url),
	new URL("../.github/ISSUE_TEMPLATE/config.yml", import.meta.url),
];
const ACTIVE_WORKFLOW_PATTERN = /\.ya?ml$/u;
const FULL_SHA_ACTION_PATTERN = /uses:\s+[\w-]+\/[\w-]+@[a-f0-9]{40}(?:\s|$)/gu;
const APPROVED_ACTIONS = [
	"actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1",
	"jdx/mise-action@3c2e0cf82a5b2e5249f0d3635a4d83d0ae861518",
	"actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a",
	"actions/download-artifact@3e5f45b2cfb9172054b4087a40e8e0b5a5461e7c",
];

async function read(url: URL): Promise<string> {
	return readFile(url, "utf8");
}

describe("active CI", () => {
	it("keeps ci as the only active workflow", async () => {
		const files = (await readdir(WORKFLOWS_DIRECTORY)).filter((file) =>
			ACTIVE_WORKFLOW_PATTERN.test(file),
		);

		expect(files).toEqual(["ci.yml"]);
	});

	it("is read-only, pinned, and publication-free", async () => {
		const ci = await read(CI_PATH);

		expect(ci).toContain("contents: read");
		expect(ci).toContain("jdx/mise-action@3c2e0cf82a5b2e5249f0d3635a4d83d0ae861518");
		expect(ci).not.toContain("actions/setup-node");
		expect(ci).not.toContain("node-version:");
		expect(ci).toContain("persist-credentials: false");
		expect(ci).toContain("npm ci --ignore-scripts");
		expect(ci).toContain("npm run verify:ci");
		expect(ci).toContain("runs-on: ubuntu-latest");
		expect(ci).not.toContain("id-token: write");
		expect(ci).not.toMatch(/npm publish|tags:/u);
		for (const action of APPROVED_ACTIONS.slice(0, 2)) expect(ci).toContain(action);
		expect([...ci.matchAll(FULL_SHA_ACTION_PATTERN)].length).toBe(2);
	});
});

describe("release example", () => {
	it("verifies and publishes one approval-gated OIDC artifact", async () => {
		const release = await read(RELEASE_EXAMPLE_PATH);

		for (const phrase of [
			'tags: ["v*"]',
			"Tag must match package.json version",
			"needs: [package, verify]",
			"environment: npm-release",
			"id-token: write",
			'--tarball "$package"',
			'npm publish "$package" --provenance --access public',
		]) {
			expect(release).toContain(phrase);
		}
		for (const action of APPROVED_ACTIONS) expect(release).toContain(action);
		expect(release).not.toContain("actions/setup-node");
		expect(release.match(/jdx\/mise-action@/gu)).toHaveLength(3);
		expect(release).toContain("NPM_CONFIG_REGISTRY: https://registry.npmjs.org");
		expect(release).not.toMatch(/NPM_TOKEN|NODE_AUTH_TOKEN|npm_[A-Za-z0-9]+/u);
	});
});

describe("repository automation", () => {
	it("schedules bounded weekly dependency proposals", async () => {
		const dependabot = await read(DEPENDABOT_PATH);

		expect(dependabot).toContain("package-ecosystem: github-actions");
		expect(dependabot).toContain("package-ecosystem: npm");
		expect(dependabot.match(/interval: weekly/gu)).toHaveLength(2);
		expect(dependabot).toContain("open-pull-requests-limit: 5");
	});

	it("provides privacy-safe contribution templates", async () => {
		await expect(Promise.all(COMMUNITY_PATHS.map((path) => access(path)))).resolves.toBeDefined();
		const bugReport = await read(COMMUNITY_PATHS[1]);
		const pullRequest = await read(COMMUNITY_PATHS[0]);

		expect(bugReport).toContain("Do not include prompts, session files, secrets, or private paths");
		expect(pullRequest).toContain("Security and privacy impact");
		expect(pullRequest).toContain("Package-content impact");
	});
});
