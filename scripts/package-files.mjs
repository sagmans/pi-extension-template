import { PACKAGE_FILE_ALLOWLIST } from "./constants.mjs";

const PACKAGE_ARCHIVE_PREFIX = "package/";

/**
 * @param {string} filePath
 * @returns {string}
 */
function normalizePackagePath(filePath) {
	return filePath
		.replaceAll("\\", "/")
		.replace(/^\.\//u, "")
		.replace(new RegExp(`^${PACKAGE_ARCHIVE_PREFIX}`), "");
}

/**
 * @param {string[]} filePaths
 * @returns {{ ok: boolean, errors: string[] }}
 */
export function verifyPackageFiles(filePaths) {
	const normalizedPaths = filePaths.map(normalizePackagePath);
	const seenPaths = new Set();
	const errors = [];

	for (const filePath of normalizedPaths) {
		if (seenPaths.has(filePath)) {
			errors.push(`Duplicate package file: ${filePath}`);
		}
		seenPaths.add(filePath);
		if (!PACKAGE_FILE_ALLOWLIST.has(filePath)) {
			errors.push(`Unexpected package file: ${filePath}`);
		}
	}

	for (const requiredPath of PACKAGE_FILE_ALLOWLIST) {
		if (!seenPaths.has(requiredPath)) {
			errors.push(`Missing required package file: ${requiredPath}`);
		}
	}

	return { ok: errors.length === 0, errors };
}
