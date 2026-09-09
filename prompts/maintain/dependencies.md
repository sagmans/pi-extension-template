# Research and update dependencies

Follow [Start](../start.md). Establish the reason for change: a demonstrated defect, security advisory, host compatibility, support expiry, or owner-requested maintenance. Preserve suitable existing tooling.

Inspect manifests, lockfiles, runtime resolution, CI, builds, install scripts, package contents, and declared support. Separate a development dependency from runtime or host-provided requirements. Use [Pi resources](../../resources/pi.md) for host changes and [Engineering resources](../../resources/engineering.md) for current primary release and advisory sources.

Compare viable supported releases, engine requirements, breaking changes, maturity, licensing, and supply-chain evidence. Do not select a version from an example manifest or an unverified search summary. Check publication history and minimum-release-age capabilities where relevant. Explain urgent security fixes that conflict with a normal aging policy rather than silently bypassing it.

Propose the narrowest coherent update and the compatibility evidence it requires. New dependencies, install hooks, broadened support, or toolchain migrations are consequential choices when not already authorized. Prefer native or installed capabilities over another package.

Apply the approved change with the target's package manager. Inspect lockfile and transitive changes, generated artifacts, and install-time execution. Avoid forced bulk fixes and unrelated upgrades. Use [Migration](migrate.md) when behavior, configuration, or data must change.

Run the target's appropriate checks and [actual-use verification](../verify/test.md), including [packaging](../verify/package.md) when resolution or shipped files change. Report versions changed, primary evidence, relevant advisories, tested support, and rollback limits. Do not widen compatibility claims based only on a successful install.
