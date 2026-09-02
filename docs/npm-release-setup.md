# npm and GitHub Publishing Authentication

Apply only to a target repository intended for public npm release. Follow the numbered lifecycle in [`RELEASE.md`](../RELEASE.md).

Set all release inputs before running automation:

```bash
export NPM_ACCOUNT=maintainer
export PKG_NAME=@scope/package
export PKG_VERSION=1.0.0
export REPO=owner/repository
export WORKFLOW_FILE=release.yml
export ENVIRONMENT=npm-release
export REVIEWER=owner
export TAG_PATTERN='v*'
```

Run read-only checks first. Preview each mutation before repeating it with explicit confirmation:

```bash
bash scripts/npm/preflight.sh
bash scripts/npm/validate-workflow.sh

DRY_RUN=1 CONFIRM=bootstrap-publish bash scripts/npm/bootstrap-publish.sh
CONFIRM=bootstrap-publish bash scripts/npm/bootstrap-publish.sh

DRY_RUN=1 CONFIRM=setup-github-release bash scripts/npm/setup-github-release.sh
CONFIRM=setup-github-release bash scripts/npm/setup-github-release.sh

DRY_RUN=1 CONFIRM=configure-trust bash scripts/npm/configure-trust.sh
CONFIRM=configure-trust bash scripts/npm/configure-trust.sh

DRY_RUN=1 CONFIRM=harden-publishing bash scripts/npm/harden-publishing.sh
CONFIRM=harden-publishing bash scripts/npm/harden-publishing.sh

bash scripts/npm/verify.sh
```

Manual interaction is limited to npm login, passkey or two-factor authentication challenges, and release approvals.

## 1. npm account and package access

1. Create the maintainer account or organization on npm.
2. Enable account-level two-factor authentication and secure recovery codes.
3. For a new package, complete the one-time manual bootstrap in `RELEASE.md`; npm requires the package to exist before trust can be configured.
4. For an existing package, confirm the maintainer has write access and the package owner/scope is correct.
5. For interactive bootstrap or administration, run `npm login --registry=https://registry.npmjs.org` and verify with `npm whoami --registry=https://registry.npmjs.org`. OIDC publishing itself does not make `npm whoami` succeed.

## 2. GitHub environment

Use `scripts/npm/setup-github-release.sh` as the primary setup path. It configures the approval environment, reviewer, tag deployment policy, and admin-only release-tag ruleset through the GitHub API.

1. Run it with `DRY_RUN=1 CONFIRM=setup-github-release`.
2. Inspect the planned API requests.
3. Run it with `CONFIRM=setup-github-release`.
4. Run `scripts/npm/verify.sh` to read back the resulting state.
5. Keep repository Actions permissions read-only by default. Only the publish job receives `id-token: write`; this permits requesting an OIDC token, not repository writes.

UI fallback: If the GitHub CLI or required API is unavailable, use repository **Settings → Environments** and **Settings → Rules → Rulesets** to apply the same reviewer, tag policy, and admin-only restrictions. Then run `scripts/npm/verify.sh`.

## 3. npm trusted publisher

Use `scripts/npm/configure-trust.sh` as the primary setup path after the package exists. The caller must have package write access, npm `11.15.0` or newer, and account two-factor authentication enabled.

1. Authenticate with npm.
2. Run it with `DRY_RUN=1 CONFIRM=configure-trust`.
3. Inspect the planned `npm trust github` command.
4. Run it with `CONFIRM=configure-trust`.
5. Run `scripts/npm/verify.sh` to read back the trusted-publisher identity and permission.

UI fallback: If `npm trust` is unavailable, use npm package **Settings → Trusted Publisher → GitHub Actions**. Enter the exact, case-sensitive GitHub owner and repository, **Workflow filename:** `WORKFLOW_FILE`, and environment: `ENVIRONMENT`. Set **Allowed actions:** `npm publish` only, then run `scripts/npm/verify.sh`.

## 4. Workflow activation

1. Copy `.github/workflows/release.yml.example` to `.github/workflows/release.yml` through a reviewed PR.
2. Keep GitHub-hosted runners; npm OIDC trusted publishing does not support self-hosted runners.
3. Let the SHA-pinned mise action install the Node version from `mise.toml`; do not duplicate runtime versions in workflow files.
4. Keep workflow and non-publish jobs at `contents: read`.
5. Keep publish-job permissions at `contents: read` and `id-token: write`.
6. Set `NPM_CONFIG_REGISTRY` to `https://registry.npmjs.org` on the publish step.
7. Publish only the downloaded artifact verified by the preceding job.
8. Keep `--access public` for scoped public packages. Trusted publishing automatically generates provenance for public packages from public repositories; retaining `--provenance` makes intent explicit.
9. Do not configure `NPM_TOKEN`, `NODE_AUTH_TOKEN`, or token fallback.

## 5. Owner verification

Before activation merge, two owners compare:

1. npm package name and scope against `package.json#name`.
2. npm trusted-publisher owner/repository/workflow/environment against GitHub.
3. GitHub environment required reviewers and deployment restrictions.
4. Workflow trigger, tag/version check, artifact retention, exact-artifact verification, and permissions.
5. Public repository and exact `package.json#repository` URL when provenance is required.

## 6. Authentication changes

Before changing GitHub owner, repository name, workflow filename, environment, or npm package ownership:

1. Pause releases.
2. Update repository metadata and npm trusted-publisher configuration in coordinated reviewed changes.
3. Re-run local verification and inspect the workflow.
4. Use the next normal release as end-to-end proof.
5. Remove obsolete trusted publishers, tokens, secrets, owners, and environment access.

## Official references

- [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [npm trust command](https://docs.npmjs.com/cli/v12/commands/npm-trust/)
- [npm scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)
- [npm provenance](https://docs.npmjs.com/generating-provenance-statements/)
- [GitHub OIDC permissions](https://docs.github.com/en/actions/reference/security/oidc)
- [GitHub deployment environments](https://docs.github.com/en/actions/reference/deployments-and-environments)
