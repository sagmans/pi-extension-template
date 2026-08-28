# Audit Checklist

## Identity and shape

- One npm package and one Pi extension entrypoint
- Target identity and repository URLs; no blueprint identity leakage
- TypeScript source package; no unintended build output
- Imported Pi core packages declared as wildcard peers and exact development dependencies
- Date provenance valid or target explicitly legacy

## Pi SDK conformance

- Runtime entrypoint uses the documented extension factory and public `ExtensionAPI`
- Imports use documented package exports; no private or internal imports
- No monkey patches, prototype/global mutation, or undocumented runtime coupling
- No unsupported host assumptions or direct bypasses around public SDK registration APIs
- Every evidenced violation reports path, evidence, compatibility or security risk, public SDK alternative, and validation suggestion
- Report only; never modify target code or configuration

## Runtime and quality

- Current Node LTS and committed npm lockfile
- Biome owns formatting/linting
- Strict TypeScript checks target source while skipping broken dependency declarations only
- Vitest covers meaningful behavior at global 80% or stronger
- Target-specific real usage documented where behavior exceeds package loading

## Security and package

- High/critical audit gate and accountable expiring exceptions
- Explicit package allowlist; no secrets, tests, local config, archives, coverage, or private data
- Pack once, isolated install, exact-artifact Pi load, temporary cleanup
- Extension full-permission warning and private vulnerability channel

## Automation and release

- Linux baseline; added platforms match support claims
- Actions pinned to full SHAs, minimum permissions, checkout credentials disabled
- Dependabot weekly npm/Actions proposals
- Release PR, version/tag match, signed tag, explicit push approval
- Protected environment, publish-job-only OIDC, provenance, same tarball, no npm token fallback
- Blueprint release example remains inert until external setup completes

## Documentation

- README installation, use, support, limits, privacy, and real behavior
- AGENTS points to operational authority
- Development, release, security, contribution, changelog, domain, ADR, smoke, and trusted-publishing guidance
- Diagnostics/configuration/storage docs accurately adapted or removed
- Internal links resolve; no stale placeholders or private evidence
