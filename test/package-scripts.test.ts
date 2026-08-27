import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { PACKAGE_ENTRY_PATH } from "../scripts/constants.mjs";
import {
	parseTarballArgument,
	runCommand,
	smokePackage,
	validateSuppliedTarballPath,
} from "../scripts/smoke-package.mjs";
import { runNpmPackDryRun, verifyPackageFiles } from "../scripts/verify-package.mjs";

const FIXTURE_PREFIX = "pi-extension-package-test-";
const FIXTURE_PACKAGE_NAME = "fixture-extension";
const TARBALL_NAME = "fixture-extension-1.0.0.tgz";
const COMMAND_SUCCESS = { stdout: "", stderr: "", code: 0 };
const COMMAND_FAILURE = { stdout: "", stderr: "failed", code: 1 };
const roots: string[] = [];

afterEach(async () => {
	await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

async function createFixtureRoot(): Promise<string> {
	const root = await mkdtemp(join(tmpdir(), FIXTURE_PREFIX));
	roots.push(root);
	await writeFile(join(root, "package.json"), JSON.stringify({ name: FIXTURE_PACKAGE_NAME }));
	return root;
}

function createSuccessfulRunner(options: { loadOutput?: string } = {}) {
	const calls: Array<{ command: string; args: string[] }> = [];
	const runner = async (command: string, args: string[]) => {
		calls.push({ command, args });
		if (args[0] === "pack") {
			const artifactDirectory = args.at(-1);
			if (artifactDirectory === undefined) throw new Error("Missing artifact directory");
			await writeFile(join(artifactDirectory, TARBALL_NAME), "fixture");
		}
		if (args[0] === "install") {
			const prefixIndex = args.indexOf("--prefix");
			const installRoot = args[prefixIndex + 1];
			const nodeModules = join(installRoot, "node_modules");
			await mkdir(join(nodeModules, FIXTURE_PACKAGE_NAME), { recursive: true });
			await mkdir(join(nodeModules, ".bin"), { recursive: true });
			await writeFile(
				join(nodeModules, FIXTURE_PACKAGE_NAME, PACKAGE_ENTRY_PATH),
				"export default () => {};",
			);
			await writeFile(join(nodeModules, ".bin", "pi"), "fixture");
		}
		return { ...COMMAND_SUCCESS, stdout: options.loadOutput ?? "" };
	};
	return { calls, runner };
}

describe("package dry-run", () => {
	it("returns files from one npm package record", async () => {
		const runner = async () => ({
			...COMMAND_SUCCESS,
			stdout: JSON.stringify([{ files: [{ path: "index.ts" }, { path: "package.json" }] }]),
		});

		await expect(runNpmPackDryRun("/tmp/project", runner)).resolves.toEqual([
			"index.ts",
			"package.json",
		]);
	});

	it("rejects failed and malformed npm output", async () => {
		await expect(runNpmPackDryRun("/tmp/project", async () => COMMAND_FAILURE)).rejects.toThrow(
			"npm pack dry-run failed",
		);
		await expect(
			runNpmPackDryRun("/tmp/project", async () => ({ ...COMMAND_SUCCESS, stdout: "[]" })),
		).rejects.toThrow("exactly one package record");
	});

	it("normalizes package paths before validation", () => {
		expect(verifyPackageFiles(["LICENSE", "README.md", ".\\index.ts", "package.json"])).toEqual({
			ok: true,
			errors: [],
		});
	});
});

describe("package smoke", () => {
	it("packs, installs, and loads one extension", async () => {
		const rootDirectory = await createFixtureRoot();
		const { calls, runner } = createSuccessfulRunner();

		const result = await smokePackage({ rootDirectory, commandRunner: runner });

		expect(result.tarballPath).toBe(TARBALL_NAME);
		expect(calls.map(({ args }) => args[0])).toEqual(["pack", "install", "--extension"]);
	});

	it("loads a supplied absolute tarball without repacking", async () => {
		const rootDirectory = await createFixtureRoot();
		const tarballPath = join(rootDirectory, TARBALL_NAME);
		await writeFile(tarballPath, "fixture");
		const { calls, runner } = createSuccessfulRunner();

		await smokePackage({ rootDirectory, tarballPath, commandRunner: runner });

		expect(calls.some(({ args }) => args[0] === "pack")).toBe(false);
	});

	it("rejects pack and install failures", async () => {
		const rootDirectory = await createFixtureRoot();
		await expect(
			smokePackage({ rootDirectory, commandRunner: async () => COMMAND_FAILURE }),
		).rejects.toThrow("npm pack failed");

		const successful = createSuccessfulRunner();
		const installFailureRunner = async (command: string, args: string[]) =>
			args[0] === "install" ? COMMAND_FAILURE : successful.runner(command, args);
		await expect(
			smokePackage({ rootDirectory, commandRunner: installFailureRunner }),
		).rejects.toThrow("isolated npm install failed");
	});

	it("rejects Pi command failure and Pi error output", async () => {
		const rootDirectory = await createFixtureRoot();
		const successful = createSuccessfulRunner();
		const loadFailureRunner = async (command: string, args: string[]) =>
			args[0] === "--extension" ? COMMAND_FAILURE : successful.runner(command, args);
		await expect(smokePackage({ rootDirectory, commandRunner: loadFailureRunner })).rejects.toThrow(
			"Pi extension load failed",
		);

		const { runner } = createSuccessfulRunner({ loadOutput: "Extension error" });
		await expect(smokePackage({ rootDirectory, commandRunner: runner })).rejects.toThrow(
			"Pi reported an extension loading error",
		);
	});

	it("rejects invalid package identity and missing supplied archive", async () => {
		const rootDirectory = await mkdtemp(join(tmpdir(), FIXTURE_PREFIX));
		roots.push(rootDirectory);
		await writeFile(join(rootDirectory, "package.json"), "{}");
		const tarballPath = join(rootDirectory, TARBALL_NAME);
		await writeFile(tarballPath, "fixture");
		await expect(
			smokePackage({ rootDirectory, tarballPath, commandRunner: async () => COMMAND_SUCCESS }),
		).rejects.toThrow("must declare a package name");

		await expect(
			smokePackage({
				rootDirectory,
				tarballPath: join(rootDirectory, "missing.tgz"),
				commandRunner: async () => COMMAND_SUCCESS,
			}),
		).rejects.toThrow();
	});

	it("rejects a supplied non-tarball path", () => {
		expect(() => validateSuppliedTarballPath("/tmp/package.zip")).toThrow("must end with .tgz");
	});
});

describe("smoke command arguments", () => {
	it("accepts pack mode or one absolute tarball", () => {
		expect(parseTarballArgument([])).toBeUndefined();
		expect(parseTarballArgument(["--tarball", "/tmp/package.tgz"])).toBe("/tmp/package.tgz");
	});

	it("rejects unsupported arguments", () => {
		expect(() => parseTarballArgument(["--unknown"])).toThrow("Usage:");
	});
});

describe("command runner", () => {
	it("captures successful and failed process exits", async () => {
		await expect(runCommand(process.execPath, ["--version"])).resolves.toMatchObject({ code: 0 });
		await expect(runCommand(process.execPath, ["-e", "process.exit(3)"])).resolves.toMatchObject({
			code: 3,
		});
		await expect(runCommand("missing-pi-extension-command", [])).resolves.toMatchObject({
			code: 1,
		});
	});
});
