# Package Lifecycle and Release

This procedure applies only to an adapted target repository. This reference repository never releases.

## 1. Day 0

1. Choose the final npm name and confirm the owner or organization controls its scope.
2. Create or verify maintainer npm accounts, enable two-factor authentication, and store recovery codes securely.
3. Keep the GitHub repository public when npm provenance is required. Confirm `package.json#repository` exactly matches it.
4. Adapt package identity, public entrypoint, imported Pi peer dependencies, support matrix, package allowlist, README, security contact, and changelog.
5. Install the pinned runtime with `mise install`, then run `mise exec -- npm ci --ignore-scripts` and `mise exec -- npm run verify:ci`.
6. Keep `.github/workflows/release.yml.example` inert until the applicable onboarding path and [authentication setup](docs/npm-release-setup.md) are complete.

## 2. New package bootstrap

npm trusted publishing requires the package to exist first. Bootstrap only the initial version manually:

1. Prepare and merge the initial release PR with the intended version and changelog.
2. Refresh the merged commit, repeat full verification, create a signed `vX.Y.Z` tag, and obtain explicit approval before pushing it.
3. Pack once into a clean directory. Run package verification and load that absolute `.tgz` through Pi.
4. Run `npm login`, verify the intended owner with `npm whoami`, then publish that exact tarball using interactive two-factor authentication. Add `--access public` for the first public scoped release.
5. Confirm the version, visibility, owners, package contents, and repository link on npm.
6. Complete sections 4 and 6 before the next release. The manual bootstrap is a one-time exception and does not have CI provenance; never repeat it for routine versions.

## 3. Existing package onboarding

1. Confirm the npm package, visibility, owners, latest version, repository link, and local `package.json` describe the same project.
2. Audit current CI credentials. Remove publish-token paths only after trusted publishing is configured and proven.
3. Do not republish or retag an existing version.
4. Complete section 4 through a reviewed PR. Use section 5 for the next version.

## 4. Activate trusted publishing

1. Complete every npm and GitHub field in [npm trusted-publishing setup](docs/npm-release-setup.md).
2. Copy `.github/workflows/release.yml.example` to `.github/workflows/release.yml`; adapt package identity and target-specific verification without weakening artifact, permission, or approval invariants.
3. Verify only the publish job has `id-token: write`; all other jobs remain read-only.
4. Confirm the workflow packs once, verifies and loads the same tarball, waits for `npm-release` approval, then publishes that tarball with provenance and never falls back to an npm token.
5. Merge activation only after review, green CI, exact workflow/npm/environment name comparison, and owner sign-off.
6. Do not create a test version merely to probe authentication. The next approved release is the end-to-end proof.

## 5. Recurring release

1. Create a release branch from current main.
2. Update the package version and `CHANGELOG.md`; never reuse an npm version.
3. Run `mise install`, `mise exec -- npm ci --ignore-scripts`, and `mise exec -- npm run verify:ci` plus target-specific real usage.
4. Inspect exact packed contents, support claims, dependency changes, and tag/version contract.
5. Open a release PR containing verification evidence, package-content impact, security impact, and release notes.
6. Merge only after review and required checks pass.
7. Refresh main, verify the exact merged commit, and create signed tag `vX.Y.Z`.
8. Obtain explicit approval, then push only that tag.
9. Observe package and verification jobs. At the `npm-release` gate, compare package name, version, commit, tag, and artifact evidence before approving.
10. After publication, verify npm version, provenance, contents, install command, and release notes. Record any discrepancy privately before public disclosure.

## 6. Maintenance

1. Review weekly dependency and Actions proposals; research release notes and advisories before merging.
2. Keep Node, Pi, Actions pins, package allowlist, support claims, owners, and docs synchronized through reviewed changes.
3. Review npm owners, maintainer 2FA, GitHub access, required reviewers, and recovery access periodically and whenever maintainers change.
4. Update npm trusted-publisher configuration before renaming the owner, repository, workflow file, or environment. Exact names are authentication inputs.
5. Revoke obsolete npm tokens and GitHub secrets. Routine publication must have no `NPM_TOKEN`.
6. Test the next normal release after any trust-boundary change; never weaken approval or permissions to diagnose it.

## 7. Failure and recovery

1. A version mismatch, audit failure, unexpected package file, multiple archives, Pi-load failure, missing approval, or OIDC failure stops publication.
2. Do not move, replace, or reuse a pushed public version tag. Fix source or configuration through another reviewed PR and release a new version when needed.
3. For `ENEEDAUTH`, compare npm trusted-publisher owner, repository, workflow filename, environment, allowed action, hosted runner, and `id-token: write` exactly.
4. If a bad version reaches npm, prefer a corrected release and deprecation notice. Treat unpublish as exceptional; confirm current npm policy and user impact first.
5. Handle leaked credentials or malicious package contents through the private process in `SECURITY.md`; revoke affected access before publishing again.
