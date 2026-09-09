# Verify the distributable artifact

Follow [Start](../start.md). Establish the distribution form and intended consumers. If the target is only a local resource with no distributable package, say so and use the relevant [runtime verification](test.md) instead.

Read the target manifest, entry points, build process, resource discovery rules, and [Pi package guidance](../../resources/pi.md). Derive expected contents from actual runtime needs, documentation promises, and licensing. Do not apply the reference's former root entry path or an unrelated package allowlist.

Inspect build and packaging hooks before execution. Explain dependency installation and network side effects. Under the applicable authorization, build if needed and create one identifiable artifact. Record source revision, package identity, version, file inventory, and integrity information using native tooling.

Check that all required code, relative imports, generated or lazy assets, skills, prompts, schemas, and licenses are present. Check for private data, local configuration, unintended fixtures, and development-only content. Required runtime dependencies must resolve in the real installation context; host-provided peers are version-sensitive, not a blanket rule for every library.

Install that exact artifact into a disposable target using the intended consumer path. Load it through the supported Pi host and exercise its relevant first action, including lazy boundaries. A direct source import, dry-run file list, or successful default export check is not equivalent proof.

Report artifact identity, actual checks, supported environment, and remaining gaps. Preserve artifact identity for [release preparation](../release/prepare.md); repacking or rebuilding after verification creates new evidence work. Do not publish as part of package verification.
