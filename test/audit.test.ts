import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { evaluateAudit } from "../scripts/audit.mjs";

const CLEAN_REPORT_PATH = new URL("./fixtures/audit/clean.json", import.meta.url);
const HIGH_REPORT_PATH = new URL("./fixtures/audit/high.json", import.meta.url);
const CRITICAL_REPORT_PATH = new URL("./fixtures/audit/critical.json", import.meta.url);
const TODAY = "2026-08-27";
const FUTURE_EXPIRY = "2026-09-27";
const PAST_EXPIRY = "2026-08-26";
const REVIEW_URL = "https://github.com/example/example/pull/123";

type AuditReport = Record<string, unknown>;
type AuditExceptions = { exceptions: Array<Record<string, unknown>> };

async function readReport(url: URL): Promise<AuditReport> {
	return JSON.parse(await readFile(url, "utf8")) as AuditReport;
}

function exception(overrides: Record<string, unknown> = {}): AuditExceptions {
	return {
		exceptions: [
			{
				advisoryId: 123456,
				reason: "No compatible patched transitive release is available.",
				owner: "repository-maintainer",
				expires: FUTURE_EXPIRY,
				reviewUrl: REVIEW_URL,
				...overrides,
			},
		],
	};
}

describe("dependency audit policy", () => {
	it("passes a clean report", async () => {
		const result = evaluateAudit(await readReport(CLEAN_REPORT_PATH), { exceptions: [] }, TODAY);

		expect(result).toEqual({ ok: true, violations: [], warnings: [] });
	});

	it("blocks high and critical advisories", async () => {
		const high = evaluateAudit(await readReport(HIGH_REPORT_PATH), { exceptions: [] }, TODAY);
		const critical = evaluateAudit(
			await readReport(CRITICAL_REPORT_PATH),
			{ exceptions: [] },
			TODAY,
		);

		expect(high.ok).toBe(false);
		expect(high.violations).toContainEqual(expect.stringContaining("123456"));
		expect(critical.ok).toBe(false);
		expect(critical.violations).toContainEqual(expect.stringContaining("789012"));
	});

	it("accepts one matching unexpired exception", async () => {
		const result = evaluateAudit(await readReport(HIGH_REPORT_PATH), exception(), TODAY);

		expect(result).toEqual({ ok: true, violations: [], warnings: [] });
	});

	it.each([
		["reason", ""],
		["owner", ""],
		["expires", "not-a-date"],
		["reviewUrl", "http://example.com/review"],
	])("rejects an invalid %s", async (field, value) => {
		const result = evaluateAudit(
			await readReport(HIGH_REPORT_PATH),
			exception({ [field]: value }),
			TODAY,
		);

		expect(result.ok).toBe(false);
		expect(result.violations).toContainEqual(expect.stringContaining(`Invalid exception ${field}`));
	});

	it("rejects expired and duplicate exceptions", async () => {
		const expired = evaluateAudit(
			await readReport(HIGH_REPORT_PATH),
			exception({ expires: PAST_EXPIRY }),
			TODAY,
		);
		const duplicateRecord = exception().exceptions[0];
		const duplicate = evaluateAudit(
			await readReport(HIGH_REPORT_PATH),
			{ exceptions: [duplicateRecord, duplicateRecord] },
			TODAY,
		);

		expect(expired.violations).toContainEqual(expect.stringContaining("Expired exception"));
		expect(duplicate.violations).toContainEqual(expect.stringContaining("Duplicate exception"));
	});

	it("rejects malformed policy inputs", async () => {
		const report = await readReport(HIGH_REPORT_PATH);
		const invalidDate = evaluateAudit(report, { exceptions: [] }, "invalid");
		const missingArray = evaluateAudit(report, {}, TODAY);
		const invalidRecord = evaluateAudit(report, { exceptions: ["invalid"] }, TODAY);

		expect(invalidDate.violations).toContainEqual(
			expect.stringContaining("Invalid evaluation date"),
		);
		expect(missingArray.violations).toContainEqual(expect.stringContaining("must be an array"));
		expect(invalidRecord.violations).toContainEqual(
			expect.stringContaining("Invalid exception record"),
		);
	});

	it("blocks package-level findings without advisory details", () => {
		const report = {
			vulnerabilities: {
				transitive: {
					name: "transitive",
					severity: "high",
					via: ["upstream-package"],
				},
				unknown: {
					name: "unknown",
					severity: "unknown",
					via: [],
				},
			},
		};
		const result = evaluateAudit(report, { exceptions: [] }, TODAY);

		expect(result.violations).toContainEqual(expect.stringContaining("package:transitive"));
		expect(result.violations).not.toContainEqual(expect.stringContaining("package:unknown"));
	});

	it("warns about stale exceptions and nonblocking findings", async () => {
		const cleanWithException = evaluateAudit(
			await readReport(CLEAN_REPORT_PATH),
			exception(),
			TODAY,
		);
		const moderateReport = {
			vulnerabilities: {
				moderate: {
					name: "moderate",
					severity: "moderate",
					via: [],
				},
			},
		};
		const moderate = evaluateAudit(moderateReport, { exceptions: [] }, TODAY);

		expect(cleanWithException.ok).toBe(true);
		expect(cleanWithException.warnings).toContainEqual(expect.stringContaining("Unused exception"));
		expect(moderate.ok).toBe(true);
		expect(moderate.warnings).toContainEqual(expect.stringContaining("moderate"));
	});
});
