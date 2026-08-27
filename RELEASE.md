# Release

This procedure applies only to an adapted target repository. This reference repository never releases.

## Preconditions

- Complete [npm trusted-publishing setup](docs/npm-release-setup.md).
- Activate the reviewed release example as `.github/workflows/release.yml` in the target.
- Protect the `npm-release` environment with required reviewer approval.
- Keep package identity, repository URL, changelog, support claims, and package allowlist current.

## Release PR

1. Create a release branch from updated main.
2. Update package version and `CHANGELOG.md`.
3. Run `npm ci --ignore-scripts` and `npm run verify:ci`.
4. Inspect exact packed contents and confirm tag/version contract.
5. Open a release PR containing evidence and release impact.
6. Merge only after review and green required checks.

## Signed tag

Refresh main after merge and verify the exact merged commit. Create a signed tag named `vX.Y.Z`. Pushing the signed tag requires explicit approval because it crosses the publication boundary.

## Publication invariant

The target workflow packs once, verifies the same tarball, waits for environment approval, then publishes that same tarball using npm OIDC with provenance. It never falls back to an npm token. The publish job alone receives `id-token: write`; no long-lived npm credential exists.

## Failure and recovery

A version mismatch, audit failure, unexpected package file, multiple archives, Pi-load failure, missing approval, or OIDC failure stops publication. Fix through another reviewed PR; never move or reuse a public version tag. If a bad version reaches npm, prefer a corrected release and deprecation notice. Treat unpublish as exceptional and confirm npm policy and user impact first.
