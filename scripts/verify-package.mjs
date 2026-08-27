import { pathToFileURL } from "node:url";
import { verifyPackageFiles } from "./package-files.mjs";
import { runCommand } from "./smoke-package.mjs";

export { verifyPackageFiles } from "./package-files.mjs";

const NPM_COMMAND = process.platform === "win32" ? "npm.cmd" : "npm";
const PACK_ARGUMENTS = ["pack", "--dry-run", "--json"];
const CURRENT_DIRECTORY = process.cwd();

/** @typedef {{ path: string }} PackFile */
/** @typedef {{ files: PackFile[] }} PackRecord */

/**
 * @param {string} rootDirectory
 * @param {typeof runCommand} [commandRunner]
 * @returns {Promise<string[]>}
 */
export async function runNpmPackDryRun(rootDirectory, commandRunner = runCommand) {
	const result = await commandRunner(NPM_COMMAND, PACK_ARGUMENTS, { cwd: rootDirectory });
	if (result.code !== 0) {
		throw new Error(`npm pack dry-run failed: ${result.stderr.trim()}`);
	}

	const records = /** @type {PackRecord[]} */ (JSON.parse(result.stdout));
	if (!Array.isArray(records) || records.length !== 1 || !Array.isArray(records[0]?.files)) {
		throw new Error("npm pack dry-run must return exactly one package record");
	}

	return records[0].files.map((file) => file.path);
}

async function main() {
	const filePaths = await runNpmPackDryRun(CURRENT_DIRECTORY);
	const result = verifyPackageFiles(filePaths);
	if (!result.ok) {
		for (const error of result.errors) {
			console.error(error);
		}
		process.exitCode = 1;
		return;
	}
	console.log(`Verified package files: ${filePaths.join(", ")}`);
}

const isMain =
	process.argv[1] !== undefined && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
	await main();
}
