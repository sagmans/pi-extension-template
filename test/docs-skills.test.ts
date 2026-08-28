import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const REPOSITORY_ROOT = fileURLToPath(new URL("..", import.meta.url));
const REFERENCE_ONLY_STATEMENT =
	"Reference blueprint only: this repository is not shipped, deployed, released, or published.";
const NO_CONTRIBUTIONS_STATEMENT =
	"This repository is a general reference blueprint and does not accept contributions.";
const REPOSITORY_CONTRIBUTION_INVITATIONS = [
	"Use public issues only for non-sensitive bugs and proposals.",
	"Before a pull request:",
	"this blueprint's maintainers require signed DCO commits",
];
const REQUIRED_DOCUMENTS = [
	"README.md",
	"AGENTS.md",
	"DEVELOPMENT.md",
	"RELEASE.md",
	"SECURITY.md",
	"CONTRIBUTING.md",
	"CHANGELOG.md",
	"CONTEXT.md",
	"docs/maintainer-smoke.md",
	"docs/npm-release-setup.md",
	"docs/diagnostics.md",
	"docs/configuration.md",
	"docs/storage.md",
	"docs/adr/0001-reference-blueprint.md",
	"docs/adr/0002-agent-driven-adoption.md",
	"docs/standard/migrations/2026-08-28.md",
];
const ADAPT_OR_REMOVE_DOCUMENTS = [
	"docs/diagnostics.md",
	"docs/configuration.md",
	"docs/storage.md",
];
const SKILLS = ["audit-pi-extension", "adopt-pi-extension-template"];
const MARKDOWN_LINK_PATTERN = /\[[^\]]+\]\(([^)]+)\)/gu;
const FRONTMATTER_PATTERN = /^---\n([\s\S]+?)\n---/u;

async function readRepositoryFile(path: string): Promise<string> {
	return readFile(resolve(REPOSITORY_ROOT, path), "utf8");
}

function frontmatterValue(frontmatter: string, key: string): string | undefined {
	const prefix = `${key}:`;
	return frontmatter
		.split("\n")
		.find((line) => line.startsWith(prefix))
		?.slice(prefix.length)
		.trim();
}

describe("blueprint documentation", () => {
	it("contains every required document", async () => {
		await expect(
			Promise.all(REQUIRED_DOCUMENTS.map((path) => access(resolve(REPOSITORY_ROOT, path)))),
		).resolves.toBeDefined();
	});

	it("makes README the complete reference-only agent entry point", async () => {
		const readme = await readRepositoryFile("README.md");

		expect(readme).toContain(REFERENCE_ONLY_STATEMENT);
		expect(readme).toContain("run an agent from this repository");
		expect(readme).toContain("absolute target repository path");
		for (const skill of SKILLS) expect(readme).toContain(skill);
		for (const document of REQUIRED_DOCUMENTS.filter((path) => path !== "README.md")) {
			expect(readme).toContain(document);
		}
	});

	it("keeps contribution guidance target-facing", async () => {
		const contributing = await readRepositoryFile("CONTRIBUTING.md");

		expect(contributing).toContain(NO_CONTRIBUTIONS_STATEMENT);
		for (const invitation of REPOSITORY_CONTRIBUTION_INVITATIONS) {
			expect(contributing).not.toContain(invitation);
		}
	});

	it("uses mise as the only runtime manager", async () => {
		const [mise, development, readme] = await Promise.all([
			readRepositoryFile("mise.toml"),
			readRepositoryFile("DEVELOPMENT.md"),
			readRepositoryFile("README.md"),
		]);

		expect(mise).toContain('node = "24.20.0"');
		expect(development).toContain("mise install");
		expect(development).toContain("mise exec -- npm ci --ignore-scripts");
		expect(readme).toContain("mise");
		await expect(access(resolve(REPOSITORY_ROOT, ".nvmrc"))).rejects.toThrow();
	});

	it("keeps AGENTS concise and points to operational authority", async () => {
		const agents = await readRepositoryFile("AGENTS.md");

		expect(agents).toContain("DEVELOPMENT.md");
		expect(agents).toContain("RELEASE.md");
		expect(agents).toContain("SECURITY.md");
		expect(agents).toContain("README.md");
		expect(agents).toContain("npm run verify:ci");
	});

	it("defines release safety invariants", async () => {
		const release = await readRepositoryFile("RELEASE.md");

		for (const phrase of [
			"release PR",
			"signed tag",
			"explicit approval",
			"same tarball",
			"OIDC",
			"provenance",
			"never falls back to an npm token",
		]) {
			expect(release).toContain(phrase);
		}
	});

	it("documents the complete package publishing lifecycle", async () => {
		const [release, setup] = await Promise.all([
			readRepositoryFile("RELEASE.md"),
			readRepositoryFile("docs/npm-release-setup.md"),
		]);

		for (const heading of [
			"## 1. Day 0",
			"## 2. New package bootstrap",
			"## 3. Existing package onboarding",
			"## 4. Activate trusted publishing",
			"## 5. Recurring release",
			"## 6. Maintenance",
			"## 7. Failure and recovery",
		]) {
			expect(release).toContain(heading);
		}
		for (const phrase of [
			"npm login",
			"two-factor authentication",
			"required reviewers",
			"Workflow filename",
			"Allowed actions",
			"id-token: write",
			"Do not configure `NPM_TOKEN`",
		]) {
			expect(setup).toContain(phrase);
		}
	});

	it("labels extension-specific guidance for adaptation", async () => {
		for (const path of ADAPT_OR_REMOVE_DOCUMENTS) {
			expect(await readRepositoryFile(path)).toContain("Adapt or remove");
		}
	});

	it("resolves internal Markdown links", async () => {
		for (const path of REQUIRED_DOCUMENTS) {
			const content = await readRepositoryFile(path);
			for (const match of content.matchAll(MARKDOWN_LINK_PATTERN)) {
				const target = match[1];
				if (/^(?:https?:|mailto:|#)/u.test(target)) continue;
				const fileTarget = target.split("#", 1)[0];
				await expect(
					access(resolve(REPOSITORY_ROOT, dirname(path), fileTarget)),
				).resolves.toBeUndefined();
			}
		}
	});
});

describe("blueprint skills", () => {
	it.each(SKILLS)("provides valid %s frontmatter and references", async (skillName) => {
		const skillPath = `.agents/skills/${skillName}/SKILL.md`;
		const skill = await readRepositoryFile(skillPath);
		const frontmatter = skill.match(FRONTMATTER_PATTERN)?.[1];

		expect(frontmatter).toBeDefined();
		expect(frontmatterValue(frontmatter ?? "", "name")).toBe(skillName);
		const description = frontmatterValue(frontmatter ?? "", "description");
		expect(description).toMatch(/^Use when /u);
		expect(description?.length).toBeLessThanOrEqual(1024);
		expect(skill).toContain("target instructions");
		expect(skill).toContain("commit, tag, push, or publish");

		for (const match of skill.matchAll(MARKDOWN_LINK_PATTERN)) {
			const target = match[1];
			if (/^https?:/u.test(target)) continue;
			await expect(
				access(resolve(REPOSITORY_ROOT, dirname(skillPath), target.split("#", 1)[0])),
			).resolves.toBeUndefined();
		}
	});

	it("audits unsupported Pi SDK usage without changing targets", async () => {
		const [audit, checklist] = await Promise.all([
			readRepositoryFile(".agents/skills/audit-pi-extension/SKILL.md"),
			readRepositoryFile(".agents/skills/audit-pi-extension/references/checklist.md"),
		]);

		for (const phrase of [
			"Pi SDK conformance",
			"private or internal imports",
			"monkey patches",
			"undocumented runtime coupling",
			"path, evidence, compatibility or security risk, public SDK alternative, and validation suggestion",
			"Report only",
		]) {
			expect(`${audit}\n${checklist}`).toContain(phrase);
		}
	});

	it("keeps audit read-only and adoption branch-complete", async () => {
		const audit = await readRepositoryFile(".agents/skills/audit-pi-extension/SKILL.md");
		const adoption = await readRepositoryFile(
			".agents/skills/adopt-pi-extension-template/SKILL.md",
		);

		expect(audit).toContain("Read-only completion criterion");
		for (const targetState of [
			"Empty target",
			"Legacy target",
			"Outdated target",
			"Current target",
		]) {
			expect(adoption).toContain(targetState);
		}
	});
});
