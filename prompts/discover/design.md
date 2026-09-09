# Design from the outcome

Use before consequential new behavior, integration, or architecture changes. Follow [Start](../start.md). Produce a decision the user can assess, not an implementation disguised as research.

Trace how the requested outcome enters the target, touches state and dependencies, and returns to the user. Name the existing owner of each responsibility. Read the target's vocabulary, decisions, support claims, and relevant [Pi contracts](../../resources/pi.md).

Ask whether the host or an existing target capability already solves the problem. Compare the smallest viable approaches, including doing less. Explain the constraints that eliminate alternatives. Avoid a new abstraction solely for future flexibility.

Make the important boundaries explicit:

- Who owns state, cleanup, cancellation, and failure recovery?
- Which facts are durable, session-local, model-visible, or private? What happens on reload, resume, fork, compaction, or concurrent use where relevant?
- Which user actions and headless modes are supported? What is the honest fallback elsewhere?
- Which external inputs and permissions cross a trust boundary? Where is authorization actually enforced?
- What can public Pi APIs express? If private integration is proposed, what unmet requirement warrants the compatibility cost?

Link upstream behavior rather than explaining the API again. For configuration, learn existing host/profile boundaries and settle target precedence, invalid-input handling, and persistence needs. For inter-extension work, prefer documented contracts and standalone behavior rather than assumptions about another extension's internals.

Show a concise proposed flow, acceptance conditions, alternatives rejected with reasons, and unresolved consequential choices. Use a small diagram when it clarifies ownership. Propose the highest practical [verification seam](../verify/test.md). Record a durable decision only when its rationale would otherwise be lost.

Stop when the user has enough evidence to settle the design. Begin [implementation](../develop/implement.md) only within the approved scope. Do not turn speculative future needs into required components.
