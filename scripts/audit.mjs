import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { runCommand } from "./smoke-package.mjs";

const NPM_COMMAND = process.platform === "win32" ? "npm.cmd" : "npm";
const AUDIT_ARGUMENTS = ["audit", "--json"];
const EXCEPTIONS_PATH = new URL("../audit-exceptions.json", import.meta.url);
const CURRENT_DIRECTORY = process.cwd();
const BLOCKING_SEVERITIES = new Set(["high", "critical"]);
const KNOWN_SEVERITIES = new Set(["info", "low", "moderate", "high", "critical"]);
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const HTTPS_PROTOCOL = "https:";
const MAX_REPORTED_ITEMS = 50;
const ISO_DATE_LENGTH = 10;

/** @typedef {{ id: string, packageName: string, severity: string, title: string }} Finding */
/** @typedef {{ advisoryId?: unknown, reason?: unknown, owner?: unknown, expires?: unknown, reviewUrl?: unknown }} ExceptionRecord */
/** @typedef {{ exceptions?: unknown }} ExceptionDocument */

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @param {unknown} value
 * @returns {string | undefined}
 */
function normalizeSeverity(value) {
	return typeof value === "string" && KNOWN_SEVERITIES.has(value) ? value : undefined;
}

/**
 * @param {unknown} report
 * @returns {Finding[]}
 */
function extractFindings(report) {
	if (!isRecord(report) || !isRecord(report.vulnerabilities)) return [];
	/** @type {Map<string, Finding>} */
	const findings = new Map();

	for (const [packageKey, value] of Object.entries(report.vulnerabilities)) {
		if (!isRecord(value)) continue;
		const packageName = typeof value.name === "string" ? value.name : packageKey;
		const packageSeverity = normalizeSeverity(value.severity);
		const via = Array.isArray(value.via) ? value.via : [];
		const advisoryRecords = via.filter(isRecord);

		if (advisoryRecords.length === 0 && packageSeverity !== undefined) {
			const id = `package:${packageName}`;
			findings.set(id, {
				id,
				packageName,
				severity: packageSeverity,
				title: `${packageName} vulnerability`,
			});
			continue;
		}

		for (const advisory of advisoryRecords) {
			const severity = normalizeSeverity(advisory.severity) ?? packageSeverity;
			if (severity === undefined) continue;
			const source = advisory.source;
			const id =
				typeof source === "string" || typeof source === "number"
					? String(source)
					: `package:${packageName}`;
			const title =
				typeof advisory.title === "string" ? advisory.title : `${packageName} vulnerability`;
			findings.set(id, { id, packageName, severity, title });
		}
	}

	return [...findings.values()];
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function isValidIsoDate(value) {
	if (!ISO_DATE_PATTERN.test(value)) return false;
	const parsed = new Date(`${value}T00:00:00.000Z`);
	return (
		!Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, ISO_DATE_LENGTH) === value
	);
}

/**
 * @param {ExceptionRecord} record
 * @param {number} index
 * @param {string[]} violations
 * @returns {{ id: string, expires: string } | undefined}
 */
function validateException(record, index, violations) {
	const idValue = record.advisoryId;
	const id =
		typeof idValue === "string" || typeof idValue === "number" ? String(idValue).trim() : "";
	let valid = true;
	if (id.length === 0) {
		violations.push(`Invalid exception advisoryId at index ${index}`);
		valid = false;
	}
	const requiredTextFields = [
		{ name: "reason", value: record.reason },
		{ name: "owner", value: record.owner },
	];
	for (const field of requiredTextFields) {
		if (typeof field.value !== "string" || field.value.trim().length === 0) {
			violations.push(`Invalid exception ${field.name} for advisory ${id || index}`);
			valid = false;
		}
	}
	if (typeof record.expires !== "string" || !isValidIsoDate(record.expires)) {
		violations.push(`Invalid exception expires for advisory ${id || index}`);
		valid = false;
	}
	try {
		if (
			typeof record.reviewUrl !== "string" ||
			new URL(record.reviewUrl).protocol !== HTTPS_PROTOCOL
		) {
			throw new Error("review URL must use HTTPS");
		}
	} catch {
		violations.push(`Invalid exception reviewUrl for advisory ${id || index}`);
		valid = false;
	}
	return valid ? { id, expires: /** @type {string} */ (record.expires) } : undefined;
}

/**
 * @param {unknown} report
 * @param {ExceptionDocument} exceptionDocument
 * @param {string} today
 * @returns {{ ok: boolean, violations: string[], warnings: string[] }}
 */
export function evaluateAudit(report, exceptionDocument, today) {
	/** @type {string[]} */
	const violations = [];
	/** @type {string[]} */
	const warnings = [];
	if (!isValidIsoDate(today)) {
		return { ok: false, violations: [`Invalid evaluation date: ${today}`], warnings };
	}

	const rawExceptions = Array.isArray(exceptionDocument.exceptions)
		? exceptionDocument.exceptions
		: [];
	if (!Array.isArray(exceptionDocument.exceptions)) {
		violations.push("Invalid audit exception document: exceptions must be an array");
	}

	/** @type {Map<string, { expires: string }>} */
	const validExceptions = new Map();
	for (const [index, value] of rawExceptions.entries()) {
		if (!isRecord(value)) {
			violations.push(`Invalid exception record at index ${index}`);
			continue;
		}
		const validated = validateException(value, index, violations);
		if (validated === undefined) continue;
		if (validExceptions.has(validated.id)) {
			violations.push(`Duplicate exception for advisory ${validated.id}`);
			continue;
		}
		if (validated.expires < today) {
			violations.push(`Expired exception for advisory ${validated.id}`);
			continue;
		}
		validExceptions.set(validated.id, { expires: validated.expires });
	}

	const findings = extractFindings(report);
	const usedExceptionIds = new Set();
	for (const finding of findings) {
		if (!BLOCKING_SEVERITIES.has(finding.severity)) {
			warnings.push(
				`${finding.severity} vulnerability in ${finding.packageName}: ${finding.title}`,
			);
			continue;
		}
		if (validExceptions.has(finding.id)) {
			usedExceptionIds.add(finding.id);
			continue;
		}
		violations.push(
			`${finding.severity} advisory ${finding.id} in ${finding.packageName}: ${finding.title}`,
		);
	}

	for (const id of validExceptions.keys()) {
		if (!usedExceptionIds.has(id)) warnings.push(`Unused exception for advisory ${id}`);
	}

	return { ok: violations.length === 0, violations, warnings };
}

async function main() {
	const [auditResult, exceptionText] = await Promise.all([
		runCommand(NPM_COMMAND, AUDIT_ARGUMENTS, { cwd: CURRENT_DIRECTORY }),
		readFile(EXCEPTIONS_PATH, "utf8"),
	]);
	if (auditResult.code !== 0 && auditResult.code !== 1) {
		throw new Error(`npm audit failed: ${auditResult.stderr.trim()}`);
	}
	const report = JSON.parse(auditResult.stdout);
	const exceptions = /** @type {ExceptionDocument} */ (JSON.parse(exceptionText));
	const today = new Date().toISOString().slice(0, ISO_DATE_LENGTH);
	const result = evaluateAudit(report, exceptions, today);

	for (const warning of result.warnings.slice(0, MAX_REPORTED_ITEMS)) {
		console.warn(`WARN: ${warning}`);
	}
	for (const violation of result.violations.slice(0, MAX_REPORTED_ITEMS)) {
		console.error(`ERROR: ${violation}`);
	}
	if (!result.ok) {
		process.exitCode = 1;
		return;
	}
	console.log("Dependency audit policy passed");
}

const isMain =
	process.argv[1] !== undefined && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
	await main();
}
