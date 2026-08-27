import { execFile } from "node:child_process";
import { access, mkdir, mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, isAbsolute, join } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import {
	COMMAND_ENCODING,
	COMMAND_MAX_BUFFER_BYTES,
	COMMAND_TIMEOUT_MS,
	PACKAGE_ENTRY_PATH,
	PACKAGE_OUTPUT_DIRECTORY,
	PI_PACKAGE_NAME,
	PI_PACKAGE_VERSION,
} from "./constants.mjs";

const execFileAsync = promisify(execFile);
const NPM_COMMAND = process.platform === "win32" ? "npm.cmd" : "npm";
const PI_BINARY_NAME = process.platform === "win32" ? "pi.cmd" : "pi";
const TARBALL_EXTENSION = ".tgz";
const TEMPORARY_PREFIX = "pi-extension-smoke-";
const INSTALL_DIRECTORY_NAME = "install";
const NODE_MODULES_DIRECTORY_NAME = "node_modules";
const PACKAGE_MANIFEST_NAME = "package.json";
const EXTENSION_ERROR_PATTERN = /(?:failed to load extension|extension error)/iu;

/** @typedef {{ cwd?: string }} CommandOptions */
/** @typedef {{ stdout: string, stderr: string, code: number }} CommandResult */
/** @typedef {(command: string, args: string[], options?: CommandOptions) => Promise<CommandResult>} CommandRunner */
/** @typedef {{ stdout?: unknown, stderr?: unknown, code?: unknown }} CommandFailure */

/**
 * @param {string} command
 * @param {string[]} args
 * @param {CommandOptions} [options]
 * @returns {Promise<CommandResult>}
 */
export async function runCommand(command, args, options = {}) {
	try {
		const result = await execFileAsync(command, args, {
			cwd: options.cwd,
			encoding: COMMAND_ENCODING,
			maxBuffer: COMMAND_MAX_BUFFER_BYTES,
			timeout: COMMAND_TIMEOUT_MS,
		});
		return { stdout: result.stdout, stderr: result.stderr, code: 0 };
	} catch (error) {
		const failure = /** @type {CommandFailure} */ (error);
		return {
			stdout: typeof failure.stdout === "string" ? failure.stdout : "",
			stderr: typeof failure.stderr === "string" ? failure.stderr : String(error),
			code: typeof failure.code === "number" ? failure.code : 1,
		};
	}
}

/**
 * @param {string[]} paths
 * @returns {string}
 */
export function selectTarball(paths) {
	if (paths.length !== 1) {
		throw new Error(`Expected exactly one package tarball, found ${paths.length}`);
	}
	return paths[0];
}

/**
 * @param {string} tarballPath
 * @returns {string}
 */
export function validateSuppliedTarballPath(tarballPath) {
	if (!isAbsolute(tarballPath)) {
		throw new Error("Supplied tarball path must be absolute");
	}
	if (!tarballPath.endsWith(TARBALL_EXTENSION)) {
		throw new Error(`Supplied tarball must end with ${TARBALL_EXTENSION}`);
	}
	return tarballPath;
}

/**
 * @param {string} rootDirectory
 * @returns {Promise<string>}
 */
async function readPackageName(rootDirectory) {
	const manifestPath = join(rootDirectory, PACKAGE_MANIFEST_NAME);
	const manifest = /** @type {{ name?: unknown }} */ (
		JSON.parse(await readFile(manifestPath, COMMAND_ENCODING))
	);
	if (typeof manifest.name !== "string" || manifest.name.length === 0) {
		throw new Error("Root package manifest must declare a package name");
	}
	return manifest.name;
}

/**
 * @param {CommandResult} result
 * @param {string} label
 */
async function requireSuccessfulCommand(result, label) {
	if (result.code !== 0) {
		throw new Error(`${label} failed: ${result.stderr.trim()}`);
	}
}

/**
 * @param {{ rootDirectory: string, tarballPath?: string, commandRunner?: CommandRunner }} options
 * @returns {Promise<{ tarballPath: string, entryPath: string }>}
 */
export async function smokePackage({ rootDirectory, tarballPath, commandRunner = runCommand }) {
	const temporaryRoot = await mkdtemp(join(tmpdir(), TEMPORARY_PREFIX));
	try {
		let selectedTarball;
		if (tarballPath === undefined) {
			const artifactDirectory = join(temporaryRoot, PACKAGE_OUTPUT_DIRECTORY);
			await mkdir(artifactDirectory);
			const packResult = await commandRunner(
				NPM_COMMAND,
				["pack", "--pack-destination", artifactDirectory],
				{ cwd: rootDirectory },
			);
			await requireSuccessfulCommand(packResult, "npm pack");
			const archives = (await readdir(artifactDirectory))
				.filter((fileName) => fileName.endsWith(TARBALL_EXTENSION))
				.map((fileName) => join(artifactDirectory, fileName));
			selectedTarball = selectTarball(archives);
		} else {
			selectedTarball = validateSuppliedTarballPath(tarballPath);
			await access(selectedTarball);
		}

		const packageName = await readPackageName(rootDirectory);
		const installRoot = join(temporaryRoot, INSTALL_DIRECTORY_NAME);
		await mkdir(installRoot);
		const installResult = await commandRunner(
			NPM_COMMAND,
			[
				"install",
				"--ignore-scripts",
				"--prefix",
				installRoot,
				selectedTarball,
				`${PI_PACKAGE_NAME}@${PI_PACKAGE_VERSION}`,
			],
			{ cwd: rootDirectory },
		);
		await requireSuccessfulCommand(installResult, "isolated npm install");

		const nodeModulesDirectory = join(installRoot, NODE_MODULES_DIRECTORY_NAME);
		const entryPath = join(nodeModulesDirectory, packageName, PACKAGE_ENTRY_PATH);
		const piBinaryPath = join(nodeModulesDirectory, ".bin", PI_BINARY_NAME);
		await Promise.all([access(entryPath), access(piBinaryPath)]);

		const loadResult = await commandRunner(
			piBinaryPath,
			["--extension", entryPath, "--list-models"],
			{ cwd: rootDirectory },
		);
		await requireSuccessfulCommand(loadResult, "Pi extension load");
		const loadOutput = `${loadResult.stdout}\n${loadResult.stderr}`;
		if (EXTENSION_ERROR_PATTERN.test(loadOutput)) {
			throw new Error("Pi reported an extension loading error");
		}

		return { tarballPath: basename(selectedTarball), entryPath };
	} finally {
		await rm(temporaryRoot, { recursive: true, force: true });
	}
}

/**
 * @param {string[]} args
 * @returns {string | undefined}
 */
export function parseTarballArgument(args) {
	if (args.length === 0) {
		return undefined;
	}
	if (args.length === 2 && args[0] === "--tarball") {
		return validateSuppliedTarballPath(args[1]);
	}
	throw new Error("Usage: node scripts/smoke-package.mjs [--tarball /absolute/package.tgz]");
}

async function main() {
	const result = await smokePackage({
		rootDirectory: process.cwd(),
		tarballPath: parseTarballArgument(process.argv.slice(2)),
	});
	console.log(`Pi loaded ${result.tarballPath} from ${result.entryPath}`);
}

const isMain =
	process.argv[1] !== undefined && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
	await main();
}
