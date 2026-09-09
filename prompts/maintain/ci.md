# Establish or repair CI

Follow [Start](../start.md). Determine whether the task is a new workflow, a failed check, or a review of existing automation. Read the target's actual commands and current CI evidence before recommending a provider or rewriting jobs.

For a failure, fix the source revision and inspect the failing stage, logs, environment, permissions, and dependency resolution. Reproduce locally or in a disposable equivalent where possible. Separate infrastructure failure from a product regression. Use [Debug](../develop/debug.md) rather than weakening checks to obtain green status.

For new automation, identify the evidence it should produce and the target's supported environments. Reuse documented commands. Keep expensive or credential-dependent checks separate when their cost and authority differ. Do not impose specific job names, one workflow layout, a coverage threshold, or a release trigger from this reference.

Consult current provider guidance through [Engineering resources](../../resources/engineering.md). Propose narrow permissions, immutable external-action references, controlled dependency execution, private-data-safe logs, and isolation from untrusted contributions. Explain the threat each choice addresses. Treat caches and downloaded artifacts as trust inputs, not automatically valid evidence.

Keep ordinary verification separate from [publishing access](../release/access.md) and [publication](../release/publish.md). Inspect the identity and approval boundaries between source, build, artifact, and publisher. Do not make remote settings changes or dispatch consequential jobs without the applicable authorization.

Verify the selected workflow's semantics with suitable native or existing tooling and the target's commands. A text match for a job name or indentation is not proof of workflow behavior. Report local results separately from actual remote CI runs, remaining prerequisites, and any unauthorized steps left undone.
