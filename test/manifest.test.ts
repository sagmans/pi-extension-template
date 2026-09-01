import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const MANIFEST_PATH = new URL("../.pi-extension-template.json", import.meta.url);
const MANIFEST_DOCUMENT_PATH = new URL("../docs/standard/manifest.md", import.meta.url);
const BASELINE_MIGRATION_DOCUMENT_PATH = new URL(
	"../docs/standard/migrations/2026-08-27.md",
	import.meta.url,
);
const CURRENT_MIGRATION_DOCUMENT_PATH = new URL(
	"../docs/standard/migrations/2026-08-28.md",
	import.meta.url,
);
const REQUIRED_KEYS = ["nodePolicy", "packageShape", "platforms", "standardVersion"];
const ALLOWED_PLATFORMS = new Set(["linux", "macos", "windows"]);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const EXPECTED_STANDARD_VERSION = "2026-08-28";
const EXPECTED_NODE_POLICY = "current-lts";
const EXPECTED_PACKAGE_SHAPE = "single-extension";

type TemplateManifest = {
	standardVersion: string;
	platforms: string[];
	nodePolicy: string;
	packageShape: string;
};

async function readManifest(): Promise<TemplateManifest> {
	return JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as TemplateManifest;
}

describe("blueprint manifest", () => {
	it("declares the baseline standard contract", async () => {
		const manifest = await readManifest();

		expect(Object.keys(manifest).sort()).toEqual(REQUIRED_KEYS);
		expect(manifest).toEqual({
			standardVersion: EXPECTED_STANDARD_VERSION,
			platforms: ["linux"],
			nodePolicy: EXPECTED_NODE_POLICY,
			packageShape: EXPECTED_PACKAGE_SHAPE,
		});
	});

	it("uses a valid date and unique supported platforms", async () => {
		const manifest = await readManifest();

		expect(manifest.standardVersion).toMatch(ISO_DATE_PATTERN);
		expect(manifest.platforms.length).toBeGreaterThan(0);
		expect(new Set(manifest.platforms).size).toBe(manifest.platforms.length);
		expect(manifest.platforms.every((platform) => ALLOWED_PLATFORMS.has(platform))).toBe(true);
	});

	it("documents schema and baseline migration", async () => {
		const [manifestDocument, baselineMigration, currentMigration] = await Promise.all([
			readFile(MANIFEST_DOCUMENT_PATH, "utf8"),
			readFile(BASELINE_MIGRATION_DOCUMENT_PATH, "utf8"),
			readFile(CURRENT_MIGRATION_DOCUMENT_PATH, "utf8"),
		]);

		expect(manifestDocument).toContain("exactly four required fields");
		expect(manifestDocument).toContain("successful verification");
		expect(baselineMigration).toContain("Baseline adoption");
		expect(currentMigration).toContain("mise");
		expect(currentMigration).toContain("Pi SDK conformance");
		expect(currentMigration).toContain("package publishing lifecycle");
		expect(currentMigration).toContain("npm run verify:ci");
	});
});
