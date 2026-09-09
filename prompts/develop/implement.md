# Implement an agreed behavior

Follow [Start](../start.md). Use [Design](../discover/design.md) if the outcome or ownership is not settled. Finish a user-visible slice with evidence, not merely code that compiles.

Trace the affected entry points, callers, state owners, and failure paths. Read the applicable [Pi documentation and examples](../../resources/pi.md) for the target's version before changing host integration. Preserve unrelated behavior and stronger target controls.

Turn the acceptance conditions into a failing observable check before adding nontrivial behavior. Prefer the existing test seam and tools. Implement at the narrowest responsible owner; reuse existing code or native capabilities before adding dependencies or layers.

Apply only the relevant behavioral questions:

- Tools and external integrations: validate inputs at the boundary, preserve result contracts, bound output, propagate cancellation, and distinguish retry-safe failure from uncertain side effects.
- UI and input: use the host's supported composition, theme, and effective keybindings. Check focus, editing, paste, cancellation, and inaccessible or headless modes instead of assuming defaults.
- Session and background work: identify resource ownership across asynchronous boundaries, prevent stale work from changing a replaced session, and clean up only owned resources.
- Configuration and storage: settle trust, scope, validation, concurrent writes, unknown-version preservation, and crash recovery according to the data's risk. Use [Migration](../maintain/migrate.md) for existing formats.
- Context and prompts: distinguish model-visible instructions from enforcement. Check the intended effect across supported session and compaction boundaries without duplicating host internals.

Review all affected callers for the same failure class. Avoid unrelated refactors and speculative compatibility shims. Update target-facing documentation when behavior or support claims change.

Run [verification](../verify/test.md), inspect the complete diff, and report observed behavior and limits. If delivery is requested, move to [release preparation](../release/prepare.md); implementation itself is not authority to publish or modify access.
