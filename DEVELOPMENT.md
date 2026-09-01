# Development

## Environment

Use mise to install pinned Node `24.20.0`, then install the committed npm lockfile:

```bash
mise install
mise exec -- npm ci --ignore-scripts
```

Lifecycle scripts are disabled because this blueprint does not require them and dependency installation is a supply-chain boundary.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run check` | Verify Biome formatting and lint rules. |
| `npm run check:fix` | Apply reviewed Biome fixes. |
| `npm run typecheck` | Check strict TypeScript without emitting output. |
| `npm test` | Run Vitest. |
| `npm run test:coverage` | Enforce 80% global coverage. |
| `npm run audit` | Block unexcepted high/critical advisories. |
| `npm run pack:verify` | Verify npm's dry-run package file list. |
| `npm run smoke` | Pack once, install in isolation, and load through Pi. |
| `npm run verify:ci` | Run the complete CI-equivalent gate. |

Use red-green-refactor for runtime and script behavior. A formatter, typecheck, or integration failure is evidence; diagnose it before changing policy.

## Dependency updates

Before changing a dependency:

1. Read official release notes and primary security advisories.
2. Confirm Node, TypeScript, Pi, and peer compatibility.
3. Prefer a mature stable release; npm has no native minimum-release-age policy, so verify publication history manually.
4. Install with scripts disabled when supported.
5. Review lockfile and package-content changes.
6. Run `npm run verify:ci` and real target usage.
7. Submit a normal reviewed PR.

Update `mise.toml`, `package.json#engines`, CI, documentation, and the lockfile together when advancing Node.

Dependabot opens weekly npm and GitHub Actions PRs. Treat them as proposals; perform the same research and verification.

## Audit exceptions

`audit-exceptions.json` is empty by default. A temporary record needs advisory ID, concrete reason, accountable owner, ISO expiry date, and HTTPS review URL. Expired, duplicate, malformed, or unused exceptions fail or warn. Never weaken the high-severity threshold to clear CI.

## Package policy

The reference package contains only `LICENSE`, `README.md`, `index.ts`, and `package.json`. A target adapts its allowlist to required runtime resources and documentation. Tests, secrets, local config, coverage, archives, and maintainer-only files stay outside the tarball.
