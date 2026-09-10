# Optional npm release helpers

These helpers adapt the independent release operations in [pi-history](https://github.com/sagmans/pi-history/tree/main/scripts/npm). They are optional, not a project scaffold or a release policy. The implementation uses Python's standard library to avoid a YAML-parser dependency and separate shell wrappers.

## Supported path and authority

This path supports public scoped packages on `https://registry.npmjs.org/`, with GitHub.com trusted publishing after first publication. It uses the `latest` npm tag. Other registries, staged publication, and package migration need a separate procedure.

Each remote action needs its own approval. Reading this guide, passing preflight, or setting an environment variable does not supply that approval. The helpers do not install tools, create workflows, tag, commit, push, change repository visibility, or publish this reference library.

Use [release preparation](../prompts/release/prepare.md) before first publication. Keep the verified tarball outside the target checkout. Keep that file unchanged until publication completes. Its integrity identifies its bytes, but does not prove that those bytes came from the reviewed source. Artifact review owns that link.

## Prerequisites

- Python 3.11 or newer, Git, and npm 11.15.0 or newer on a supported Node version.
- An authenticated npm account with the intended scope access and account-level 2FA.
- For GitHub controls, an authenticated `gh` CLI with repository administration access and `api --paginate --slurp` support.
- A clean target checkout with reviewed package metadata.
- For trust and GitHub controls, a reviewed release workflow in that checkout.

The helpers do not read credential files directly. Native CLIs use their existing authentication. Read failures suppress response bodies. Approved mutations inherit terminal streams so npm can request interactive 2FA. Do not record authentication URLs, passwords, recovery codes, or tokens in reports or command arguments.

Before use, compare the installed CLI help with [npm trust](https://docs.npmjs.com/cli/v11/commands/npm-trust/), [npm access](https://docs.npmjs.com/cli/v11/commands/npm-access/), and [trusted publishing](https://docs.npmjs.com/trusted-publishers/). The npm contracts were inspected on 2026-09-10. Unknown response formats stop verification instead of implying success.

## Select the target

Run from the target repository root, not the reference root. Select a reviewed local reference checkout. These identities and paths are synthetic examples:

```sh
export RELEASE_HELPER='/absolute/path/to/reference/scripts/npm/release.py'
export PKG_NAME='@example/tool'
export PKG_VERSION='1.0.0'
export REPO='example/tool'
export REGISTRY='https://registry.npmjs.org/'
export NPM_USER='example'
export SOURCE_SHA='<full-reviewed-commit-id>'
```

The helper pins both the base registry and the package's scoped registry on every npm operation. Conflicting or unsupported `publishConfig` fields stop the operation. The accepted fields are `registry`, `access: public`, and `tag: latest`.

`NPM_BIN`, `GH_BIN`, and `GIT_BIN` can select trusted executable paths. They are execution authority, not untrusted configuration inputs. The helpers never run shell command strings.

## Preflight and artifact review

```sh
python3 "$RELEASE_HELPER" preflight
```

Preflight verifies the package identity, version, repository, exact source revision, clean checkout, npm version, and npm account. It does not prove scope ownership, workflow safety, CI results, or release approval.

Create the artifact through the target's approved packaging process. `npm pack --ignore-scripts --json --pack-destination /absolute/path/to/review` is suitable when the package needs no build hooks. Review the resulting inventory and source-to-artifact relationship. Run the target's isolated installation and runtime checks against that exact artifact.

Set the archive path and the `integrity` value from the reviewed npm pack result:

```sh
export ARTIFACT='/absolute/path/to/review/example-tool-1.0.0.tgz'
export ARTIFACT_INTEGRITY='sha512-<reviewed-base64-digest>'
```

The helper compares SHA-512 bytes and the packed manifest with the checkout manifest. It does not extract the archive. Limits are 100 MiB compressed, 10,000 entries, and 1 MiB for the manifest. Larger packages need separate review rather than a silent bypass.

## First publication

First publication is independent of GitHub workflow setup. npm requires an existing package before trust configuration.

Preview the operation:

```sh
DRY_RUN=1 python3 "$RELEASE_HELPER" bootstrap-publish
```

The preview performs authenticated read-only npm calls. Native CLIs can write cache or logs. An explicit E404 means not-found for that account, not a reservation or proof of scope ownership. Other errors stop the operation.

Only after approval for this package, version, registry, source, and artifact, run:

```sh
CONFIRM=bootstrap-publish python3 "$RELEASE_HELPER" bootstrap-publish
```

The helper publishes the reviewed tarball with lifecycle scripts disabled. It refuses an existing package. It verifies the delivered version and integrity after publication. Local publication does not generate OIDC provenance.

If publication fails or its result is ambiguous, inspect the registry before any retry. The helper never retries automatically. A successful write followed by a failed verification is still a possible publication.

## Review the recurring workflow

The target owns its workflow. No workflow is generated or copied here. Review these controls together in the intended publish job:

- Approved release trigger and source revision.
- Intended environment and required approval.
- Effective `id-token: write` permission and least-privilege remaining permissions.
- Supported GitHub-hosted runner, pinned actions, and no broad fallback token.
- Exact artifact publication, or renewed evidence if the workflow rebuilds it.
- Explicit registry, public access, provenance, and disabled unneeded lifecycle hooks.

Inspect action behavior and side effects, not only YAML fields. An existing structural validator can supplement this review. This helper does not parse YAML or certify a workflow from text patterns.

After that review, set:

```sh
export WORKFLOW_FILE='release.yml'
export ENVIRONMENT='npm-release'
export WORKFLOW_REVIEWED='1'
```

This marker acknowledges a separate review. It is not a substitute for review evidence.

## Optional GitHub controls

Use this operation only when the target chooses one user reviewer and admin-only release-tag changes. Verify that the repository's GitHub plan supports these environment and ruleset controls.

```sh
export REVIEWER='release-owner'
export TAG_PATTERN='v*'
export RULESET_NAME='release-tags-admin-only'
DRY_RUN=1 python3 "$RELEASE_HELPER" setup-github-release
```

The preview shows the payloads. The helper inspects all pages before mutation. It distinguishes branch and tag deployment policies. It creates missing controls, leaves matching controls unchanged, and refuses conflicting named controls instead of overwriting them.

The selected policy allows repository administrators to create, update, and delete matching tags through a ruleset bypass. The environment requires the selected user and disables admin approval bypass. This is an explicit target choice, not a universal baseline.

Only after approval of these exact controls, run:

```sh
CONFIRM=setup-github-release python3 "$RELEASE_HELPER" setup-github-release
```

The operation verifies remote state again after mutation. There is no transaction across the APIs. On failure, inspect partial state before resuming. Existing unrelated or inherited rulesets can further restrict releases and still need human review.

## Configure npm trust and hardening

Preview each operation independently:

```sh
DRY_RUN=1 python3 "$RELEASE_HELPER" configure-trust
DRY_RUN=1 python3 "$RELEASE_HELPER" harden-publishing
```

Only after separate approval for each action, run:

```sh
CONFIRM=configure-trust python3 "$RELEASE_HELPER" configure-trust
CONFIRM=harden-publishing python3 "$RELEASE_HELPER" harden-publishing
```

Trust grants publish-only permission to the exact repository, workflow, and environment. An existing conflicting trust stops the operation. No trust is revoked automatically. Hardening requests `mfa=publish`. Verify the package's 2FA and token restrictions in npm afterward. The CLI helper does not claim MFA readback.

Record recovery ownership and protect recovery credentials outside the repository. Do not revoke credentials or change account security without separate approval.

## Verify and stop

```sh
python3 "$RELEASE_HELPER" verify
```

This verifies the package identity, version, integrity, public access, and exact publish-only trust. It does not prove MFA configuration, artifact installation, or a successful OIDC publication. Exercise the first authorized recurring release and inspect its provenance separately.

Keep the source SHA, artifact digest, action results, known limitations, and previous usable version in the target's release record. Use [recovery](../prompts/release/recover.md) for failed releases. These helpers do not unpublish, deprecate, or rewrite release history.
