# npm and GitHub Publishing Authentication

Apply only to a target repository intended for public npm release. Follow the numbered lifecycle in [`RELEASE.md`](../RELEASE.md).

## 1. npm account and package access

1. Create the maintainer account or organization on npm.
2. Enable account-level two-factor authentication and secure recovery codes.
3. For a new package, complete the one-time manual bootstrap in `RELEASE.md`; npm requires the package to exist before trust can be configured.
4. For an existing package, confirm the maintainer has write access and the package owner/scope is correct.
5. For interactive bootstrap or administration, run `npm login --registry=https://registry.npmjs.org` and verify with `npm whoami --registry=https://registry.npmjs.org`. OIDC publishing itself does not make `npm whoami` succeed.

## 2. GitHub environment

1. In repository **Settings → Environments**, create `npm-release`.
2. Configure required reviewers with the package owner or release maintainers.
3. Prevent self-review when repository governance supports it.
4. Limit deployment branches/tags to the release policy.
5. Keep repository Actions permissions read-only by default. Only the publish job receives `id-token: write`; this permits requesting an OIDC token, not repository writes.

## 3. npm trusted publisher

Use npm package **Settings → Trusted Publisher → GitHub Actions** and enter exact, case-sensitive values:

1. **Organization or user:** GitHub owner.
2. **Repository:** repository name.
3. **Workflow filename:** `release.yml`, filename only.
4. **Environment name:** `npm-release`.
5. **Allowed actions:** `npm publish` only.

Alternatively, with authenticated npm `11.15.0` or newer:

```bash
npm trust github @scope/package \
  --file release.yml \
  --repo owner/repository \
  --env npm-release \
  --allow-publish
```

The package must already exist, the caller needs package write access, and account two-factor authentication must be enabled.

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
