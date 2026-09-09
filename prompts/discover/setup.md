# Set up a usable extension project

Use for a new or unfinished target. Follow [Start](../start.md) first. The outcome is a tailored development loop, not a collection of standard files.

Inspect the target and its parent instructions. Preserve existing work. Establish the user's problem and the smallest observable behavior that makes the project useful. Learn the relevant [Pi capabilities and distribution forms](../../resources/pi.md) before proposing structure.

Resolve only choices that affect this project:

- Local project resource, reusable package, resource-only guidance, or workspace? Is publication actually intended?
- Which host versions, operating systems, terminals, and interaction modes need support? Which can be exercised now?
- Does the behavior need tools, commands, UI, session state, storage, network access, or external processes? What should remain untouched?
- Which development tools and conventions already fit? Explain alternatives through [Engineering resources](../../resources/engineering.md), not a mandatory stack.

If scope or architecture remains uncertain, use [Design](design.md). Present a reasoned proposal and ask about consequential unresolved preferences. Avoid asking the user to choose every filename or dependency.

Create the smallest authorized implementation that proves the chosen behavior. Derive entry points and metadata from Pi's current contract and the target's distribution choice. A build step, package manifest, CI workflow, and release process each need a purpose; local-only resources may not need them.

Add target-specific checks and usage instructions as the behavior is built. Use the target's package manager and approved dependencies; do not silently install global tooling. Keep credentials and personal configuration out of the project. Route storage or protocol changes through [Migration](../maintain/migrate.md) when existing users or data are involved.

Use [Verify](../verify/test.md) to exercise the actual host and first user action in disposable state. For a package, also use [Packaging](../verify/package.md). Report exact supported evidence and remaining gaps. Setup is ready only when the agreed behavior and documented development commands work; otherwise identify the blocked step. Leave publication inactive until separately authorized through [Release preparation](../release/prepare.md).
