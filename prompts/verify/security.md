# Review security and privacy

Follow [Start](../start.md) and the target's private reporting process. Establish scope and authorization before testing. Keep exploit details, secrets, private prompts, session data, and personal paths out of public artifacts.

Identify assets, actors, data flows, and trust boundaries relevant to the requested change. Read the host's security resources through [Pi resources](../../resources/pi.md). Distinguish model instructions, tool-hook controls, process containment, and actual operating-system isolation; do not describe one as another.

Trace untrusted values into filesystem access, terminal rendering, process arguments, network requests, model context, logs, and persisted state where applicable. Examine validation at the responsible boundary, data minimization, ownership, authorization, cancellation, and cleanup. An output-delivery failure may occur after a side effect; inspect retry behavior accordingly.

Review dependencies and install hooks, generated assets, build inputs, package contents, CI permissions, external actions, registry identity, and publishing credentials when they are in scope. Consult [Engineering resources](../../resources/engineering.md) for current OWASP and platform guidance. Propose appropriate dependency, secret, static, or dynamic checks with their limitations and data exposure; no scanner certifies safety.

Validate candidate findings using source reasoning or an explicitly authorized disposable reproduction. Never probe a production service or exploit a third party to strengthen a report. Explain uncertain applicability instead of assigning an unsupported severity.

Report affected behavior, conditions, evidence, impact, confidence, and the smallest corrective or investigative next action. Distinguish a recommendation from an actual target requirement. For a confirmed incident or exposed credential, use [Recover](../release/recover.md) and preserve private evidence. Do not publish details or change access as an implicit part of the review.
