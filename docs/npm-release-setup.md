# npm Trusted-Publishing Setup

Apply only to a target repository intended for public npm release.

1. Confirm public package name, scope ownership, repository URL, and initial-publication requirements against current npm documentation.
2. In npm package settings, configure a GitHub Actions trusted publisher for the exact organization, repository, workflow filename `release.yml`, and environment `npm-release`.
3. In GitHub, create the `npm-release` environment and require owner review.
4. Copy `.github/workflows/release.yml.example` to `.github/workflows/release.yml` in the target, then adapt package identity and verification commands.
5. Keep workflow permissions read-only except publish-job `id-token: write`.
6. Configure branch/tag protections and required CI according to target governance.
7. Dry-run through package and verification jobs without creating or pushing a release tag.
8. Have an owner verify npm and GitHub settings before first approved release.

Do not configure `NPM_TOKEN`. OIDC supplies a short-lived credential and provenance binds publication to the approved workflow.
