import { describe, expect, it } from "vitest";
import { PACKAGE_ENTRY_PATH, PACKAGE_FILE_ALLOWLIST } from "../scripts/constants.mjs";
import { selectTarball, validateSuppliedTarballPath } from "../scripts/smoke-package.mjs";
import { verifyPackageFiles } from "../scripts/verify-package.mjs";

const EXPECTED_PACKAGE_FILES = ["LICENSE", "README.md", "index.ts", "package.json"];
const ABSOLUTE_TARBALL_PATH = "/tmp/pi-extension-template-0.0.0.tgz";

describe("package contents", () => {
	it("allows only the reference package contract", () => {
		expect([...PACKAGE_FILE_ALLOWLIST].sort()).toEqual(EXPECTED_PACKAGE_FILES);
		expect(verifyPackageFiles(EXPECTED_PACKAGE_FILES)).toEqual({ ok: true, errors: [] });
	});

	it("rejects a missing extension entrypoint", () => {
		const files = EXPECTED_PACKAGE_FILES.filter((file) => file !== PACKAGE_ENTRY_PATH);

		expect(verifyPackageFiles(files)).toEqual({
			ok: false,
			errors: [`Missing required package file: ${PACKAGE_ENTRY_PATH}`],
		});
	});

	it("rejects unexpected and duplicate files", () => {
		const result = verifyPackageFiles([...EXPECTED_PACKAGE_FILES, "src/secret.ts", "index.ts"]);

		expect(result.ok).toBe(false);
		expect(result.errors).toContain("Duplicate package file: index.ts");
		expect(result.errors).toContain("Unexpected package file: src/secret.ts");
	});
});

describe("tarball selection", () => {
	it("selects exactly one package archive", () => {
		expect(selectTarball([ABSOLUTE_TARBALL_PATH])).toBe(ABSOLUTE_TARBALL_PATH);
	});

	it.each([{ paths: [] }, { paths: [ABSOLUTE_TARBALL_PATH, "/tmp/second.tgz"] }])(
		"rejects an archive count other than one",
		({ paths }) => {
			expect(() => selectTarball(paths)).toThrow("Expected exactly one package tarball");
		},
	);

	it("requires an absolute supplied tarball path", () => {
		expect(() => validateSuppliedTarballPath("relative.tgz")).toThrow(
			"Supplied tarball path must be absolute",
		);
	});
});
