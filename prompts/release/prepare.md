# Prepare a release without publishing

Follow [Start](../start.md). Fix the proposed source revision, version, distribution channel, package identity, and intended registry. Determine whether this is a first publication, a recurring release, or a prerelease. Read the target's own release policy rather than applying a reference baseline.

Compare changes with the previous supported release. Reconcile user-facing behavior, compatibility, migrations, documentation, licensing, known defects, and release notes. Check that declared support does not exceed the evidence. Use [Audit](../verify/audit.md) for unresolved review findings and [Migration](../maintain/migrate.md) for rollout constraints.

Collect verification evidence for that revision. Use [Packaging](../verify/package.md) to identify the exact artifact and exercise the intended installation path. Record any build or packaging step that can change the bytes. A new artifact requires renewed relevant checks.

Inspect the applicable publication authority through [Publishing access](access.md). Identify missing approvals, ownership mismatches, unsupported provider assumptions, and any difference between the inspected workflow and the workflow that will publish. Preparation must not create a release tag, dispatch publication, or change access as a hidden prerequisite.

Present a concise readiness decision against actual target requirements: ready for the authorized next step, blocked by a named condition, or unverified in a named area. Separate recommended improvements from blockers and known accepted limitations. Include artifact identity, checks, release notes, recovery approach, and the exact next action requiring authorization.

The [optional npm helpers](../../docs/npm-release-setup.md) can check explicit source and package identity. They do not replace artifact installation, runtime evidence, or approval. Preparation does not run their mutation actions.

Stop after the readiness report. Continue to [Publish](publish.md) only when the user's authorization covers that specific release action. Passing local checks alone does not prove a remote release path.
