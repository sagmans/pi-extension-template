import fs from "node:fs";

const [workflowPath, expectedEnvironment, expectedTagPattern] = process.argv.slice(2);
const JOB_NAME_PATTERN = /^ {2}([A-Za-z0-9_-]+):\s*$/u;
const DOCUMENT_SEPARATOR_PATTERN = /^\s*(?:---|\.\.\.)\s*$/u;
const ANCHOR_OR_ALIAS_PATTERN = /(?:^|[\s:[{,])[&*][A-Za-z_][A-Za-z0-9_-]*/u;
const FORBIDDEN_PUBLISH_PATTERN = /npm pack|npm run|NPM_TOKEN|NODE_AUTH_TOKEN|secrets\./u;
const REQUIRED_PUBLISH_COMMAND = 'npm publish "$package" --provenance --access public';
const REQUIRED_PACKAGE_COMMAND = "npm pack --pack-destination artifact";

/** @param {string} message */
function fail(message) {
	console.error(`error: workflow must ${message}`);
	process.exit(1);
}

/** @param {string} line */
function activeLine(line) {
	const trimmed = line.trimStart();
	return !trimmed.startsWith("#") && trimmed.length > 0;
}

const text = fs.readFileSync(workflowPath, "utf8");
const lines = text.split(/\r?\n/u);
const activeLines = lines.filter(activeLine);
if (text.includes("\t")) fail("use spaces for indentation");
if (activeLines.some((line) => DOCUMENT_SEPARATOR_PATTERN.test(line))) {
	fail("contain one implicit YAML document");
}
if (activeLines.some((line) => line.includes("!!") || ANCHOR_OR_ALIAS_PATTERN.test(line))) {
	fail("avoid YAML tags, anchors, and aliases");
}

const jobsLine = activeLines.indexOf("jobs:");
if (jobsLine < 0) fail("define jobs");
const header = activeLines.slice(0, jobsLine).join("\n");
if (!header.includes(`tags: ["${expectedTagPattern}"]`)) {
	fail("use TAG_PATTERN as its tag trigger");
}
if (!/permissions:\s*\n\s+contents: read/u.test(header) || header.includes("id-token: write")) {
	fail("keep top-level permissions read-only");
}

/** @param {string} name */
function job(name) {
	const starts = [];
	for (let index = jobsLine + 1; index < activeLines.length; index += 1) {
		const match = activeLines[index].match(JOB_NAME_PATTERN);
		if (match?.[1] === name) starts.push(index);
	}
	if (starts.length !== 1) fail(`define exactly one ${name} job`);
	const start = starts[0];
	let end = activeLines.length;
	for (let index = start + 1; index < activeLines.length; index += 1) {
		if (JOB_NAME_PATTERN.test(activeLines[index])) {
			end = index;
			break;
		}
	}
	return activeLines.slice(start, end).join("\n");
}

/**
 * @param {string} block
 * @param {string} needle
 * @param {string} label
 */
function requireText(block, needle, label) {
	if (!block.includes(needle)) fail(label);
}

const packageJob = job("package");
const verifyJob = job("verify");
const publishJob = job("publish");
const packCount = activeLines.filter((line) => line.trim() === REQUIRED_PACKAGE_COMMAND).length;
const publishCount = activeLines.filter((line) => line.trim() === REQUIRED_PUBLISH_COMMAND).length;
if (packCount !== 1) fail("pack exactly once in the package job");
requireText(packageJob, REQUIRED_PACKAGE_COMMAND, "pack in the package job");
requireText(packageJob, "actions/upload-artifact@", "upload the package artifact");
requireText(packageJob, "name: npm-package", "name the package artifact consistently");
requireText(packageJob, "path: artifact/*.tgz", "upload only the package tarball");
requireText(verifyJob, "needs: package", "verify only after packaging");
requireText(verifyJob, "actions/download-artifact@", "download the package for verification");
requireText(verifyJob, 'package="$PWD/$1"', "make the verified tarball path absolute");
requireText(
	verifyJob,
	'node scripts/smoke-package.mjs --tarball "$package"',
	"smoke the absolute package artifact",
);
requireText(publishJob, "needs: [package, verify]", "publish only after package verification");
requireText(publishJob, `environment: ${expectedEnvironment}`, "use ENVIRONMENT on publish");
requireText(publishJob, "id-token: write", "grant OIDC only to publish");
requireText(publishJob, "actions/download-artifact@", "download the verified package for publish");
requireText(publishJob, 'package="$PWD/$1"', "make the published tarball path absolute");
requireText(publishJob, REQUIRED_PUBLISH_COMMAND, "publish the verified tarball with provenance");
if (publishCount !== 1) fail("contain one exact npm publish command");
if (FORBIDDEN_PUBLISH_PATTERN.test(publishJob)) fail("keep the publish job artifact-only");

console.log(`workflow passed: ${workflowPath}`);
