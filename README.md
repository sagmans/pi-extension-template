# Pi Extension Blueprint

## Reference only

**Reference blueprint only: this repository is not shipped, deployed, released, or published.**

This repository is an executable reference for public npm packages containing one [Pi](https://github.com/earendil-works/pi-mono) extension. Its active automation verifies the blueprint. Its package is private. Its publication workflow is an inert example.

## Use with an agent

Always run an agent from this repository so project-local skills are discoverable. Give the agent the absolute target repository path. Require it to read this README completely before touching the target.

```text
Read this repository's README completely. Use the adopt-pi-extension-template skill to set up the target repository at the absolute path I provide. Preserve target-specific intent, ask before ambiguous choices, run full verification, and do not commit or publish.
```

Use `/skill:adopt-pi-extension-template` or `/skill:audit-pi-extension` when automatic skill selection does not occur.

## New empty repository

Use [adopt-pi-extension-template](.agents/skills/adopt-pi-extension-template/SKILL.md). The agent gathers package identity, purpose, imported Pi APIs, platforms, and publication intent. It adapts this blueprint, keeps publication inert until external setup is complete, runs verification, and writes provenance last.

## Audit an existing repository

Use [audit-pi-extension](.agents/skills/audit-pi-extension/SKILL.md):

```text
Read this repository's README completely. Use the audit-pi-extension skill against the target repository at the absolute path I provide. Make no target changes. Report required drift, recommendations, intentional divergence, and exact validation commands.
```

Audit is evidence-only. It also reports unsupported Pi SDK usage, private internals, monkey patches, and undocumented runtime coupling with public-API suggestions; it takes no corrective action. Missing provenance means legacy, not automatically unsafe.

## Onboard, migrate, or update an existing repository

Run audit first, review its classification, then run `adopt-pi-extension-template`. The skill preserves extension behavior and project facts, applies ordered date migrations, asks one focused question per ambiguous conflict, validates, then advances `.pi-extension-template.json`.

## What the blueprint standardizes

- Current Node LTS pinned through mise, npm lockfile, TypeScript source, and one Pi extension per package
- Biome, strict TypeScript, Vitest, and 80% global coverage
- High-or-critical dependency audit policy
- Package allowlist and exact packed-artifact Pi-load smoke
- Linux CI baseline, pinned Actions, minimal permissions, and Dependabot
- Release PR, signed tag, npm OIDC, provenance, approval environment, and immutable artifact
- Agent, development, security, contribution, domain, ADR, diagnostics, configuration, storage, and smoke guidance

## What agents must adapt

Adapt package identity, repository URLs, extension entry files, package allowlist, imported Pi peer dependencies, support matrix, tests, user documentation, configuration, diagnostics, storage, and target-specific real usage. Preserve stronger controls. Never copy this repository's private identity or reference-only wording into a release-ready target.

## Verification contract

Run `npm run verify:ci`. It covers dependency audit, Biome, strict types, Vitest coverage, package allowlist, one packed tarball, isolated installation, and Pi entrypoint loading. Feature-specific real usage remains a target responsibility.

See [DEVELOPMENT.md](DEVELOPMENT.md) and [docs/maintainer-smoke.md](docs/maintainer-smoke.md).

## Release contract

Nothing here releases. Target repositories adapt `.github/workflows/release.yml.example` only after completing [npm release setup](docs/npm-release-setup.md). Follow [RELEASE.md](RELEASE.md).

## Repository map

- [AGENTS.md](AGENTS.md) — required generic agent workflow
- [DEVELOPMENT.md](DEVELOPMENT.md) — local engineering and dependency updates
- [RELEASE.md](RELEASE.md) — target release procedure
- [SECURITY.md](SECURITY.md) — private vulnerability handling
- [CONTRIBUTING.md](CONTRIBUTING.md) — public participation
- [CHANGELOG.md](CHANGELOG.md) — standard evolution
- [CONTEXT.md](CONTEXT.md) — domain language
- [docs/diagnostics.md](docs/diagnostics.md), [docs/configuration.md](docs/configuration.md), [docs/storage.md](docs/storage.md) — adapt-or-remove extension guidance
- [docs/standard/host-pitfalls.md](docs/standard/host-pitfalls.md) — verified host integration failure modes with citations and reproducible checks
- [docs/adr/0001-reference-blueprint.md](docs/adr/0001-reference-blueprint.md), [docs/adr/0002-agent-driven-adoption.md](docs/adr/0002-agent-driven-adoption.md) — architecture decisions
- [manifest schema](docs/standard/manifest.md), [2026-08-27 baseline](docs/standard/migrations/2026-08-27.md), and [2026-08-28 migration](docs/standard/migrations/2026-08-28.md)
- `.github/ISSUE_TEMPLATE/bug_report.yml`, `.github/ISSUE_TEMPLATE/config.yml`, `.github/pull_request_template.md` — community examples

## Standard version and migrations

The blueprint standard version is `2026-08-28`. Target provenance lives in `.pi-extension-template.json`. Apply every migration note after the target's recorded date in chronological order; update the marker only after successful verification.

## Security

Pi extensions execute with the user's full permissions. Review target code and dependencies before installation. Report sensitive findings privately according to [SECURITY.md](SECURITY.md); never place secrets, private prompts, session files, or personal paths in public issues.

## License

[MIT](LICENSE)
