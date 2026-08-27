---
name: audit-pi-extension
description: Use when checking a new or existing single-extension Pi npm repository for blueprint compliance, template drift, migration readiness, packaging safety, release safety, or missing extension-development best practices.
---

# Audit Pi Extension

Audit an explicit target without changing it. Evidence distinguishes required drift from valid project differences.

## Inputs

Require an absolute target repository path. Resolve this skill's repository as blueprint root. Reject a target equal to blueprint root.

## Workflow

1. Read blueprint `README.md`, `docs/standard/manifest.md`, every migration after target provenance, and [the checklist](references/checklist.md).
2. Read all target instructions before inspection.
3. Inspect target Git state, package shape, runtime entrypoint, dependencies, configs, tests, package contents, CI/release automation, docs, security, and provenance.
4. Use read-only commands. Do not install dependencies, rewrite lockfiles, format, fix, stage, or change target files.
5. Classify every checklist item:
   - **Conforming** — evidence meets invariant.
   - **Required drift** — security, packaging, verification, or declared compatibility invariant fails.
   - **Recommendation** — useful but optional for target behavior.
   - **Intentional divergence** — target evidence justifies preserving difference.
   - **Not applicable** — capability does not exist in target.
6. Cite exact paths and safe validation commands. Redact private values.

## Read-only completion criterion

Complete only when target Git state is unchanged, every checklist item has one classification, every blocker has path evidence and risk, and report names next safe action. Never commit, tag, push, or publish.

## Report

```markdown
# Pi extension audit
Target: absolute path
Blueprint standard: date
Target standard: date or legacy
Verdict: ready | migration needed | blocked

## Required drift
- path — evidence; risk; validation

## Recommendations
- path — benefit; validation

## Intentional divergence
- path — target reason

## Not applicable
- item — reason

## Next action
One command or focused decision.
```

Keep empty sections empty. Do not pad findings.
