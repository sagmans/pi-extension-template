# Engineering resources and prior art

Use from [Start](../prompts/start.md) when choosing tools or comparing engineering approaches. Inspect current primary sources and the target before recommending a change. This is not a required toolchain.

## Choose for the target

| Need | Research route and trade-off |
| --- | --- |
| Runtime and dependency reproducibility | Existing lockfiles and CI first; consult [Node releases](https://nodejs.org/en/about/previous-releases), [npm](https://docs.npmjs.com/), [pnpm](https://pnpm.io/), or [Yarn](https://yarnpkg.com/). An existing runtime manager may suffice; [mise](https://mise.jdx.dev/) is one option when multiple tools need coordination. |
| Formatting and static checks | Existing conventions first; compare [TypeScript](https://www.typescriptlang.org/docs/), [Biome](https://biomejs.dev/), and [ESLint](https://eslint.org/docs/latest/). Add specialized tooling only for a demonstrated gap. |
| Behavioral verification | [Node's test runner](https://nodejs.org/api/test.html) can avoid an extra framework; [Vitest](https://vitest.dev/guide/) may fit existing TypeScript tests. Framework choice does not establish test quality. |
| CI and dependency maintenance | [GitHub Actions security](https://docs.github.com/en/actions/reference/security/secure-use) and [Dependabot](https://docs.github.com/en/code-security/dependabot) explain platform capabilities; use the equivalent primary sources for another provider. |
| Release coordination | A reviewed manual process may suffice. Compare [Changesets](https://github.com/changesets/changesets) for independently versioned packages or [release-please](https://github.com/googleapis/release-please) for release PR automation when coordination justifies it. |
| Registry identity, access, and provenance | [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/), [npm trust CLI](https://docs.npmjs.com/cli/v12/commands/npm-trust/), and [npm provenance](https://docs.npmjs.com/generating-provenance-statements/) own the contract. Consult the installed CLI and current registry evidence before mutations. |
| Dependency and supply-chain risk | [OWASP SCVS](https://owasp.org/www-project-software-component-verification-standard/), [OSV](https://osv.dev/), and registry advisories offer distinct evidence. Audit results need applicability analysis and cannot certify absence of vulnerabilities. |
| Secrets and application analysis | Compare the target platform's secret scanning, [CodeQL](https://codeql.github.com/docs/), or [Semgrep](https://semgrep.dev/docs/) when the exposure and supported languages justify them. Explain data sent to external analysis services. |

Check release history, advisories, engine compatibility, lifecycle scripts, maintenance status, and licensing before selecting a dependency version. Use a supported, mature release rather than copying versions from this reference or a popular package. Where available, propose a dependency minimum-release-age policy appropriate to the target; it reduces some risks, not all.

## Read community choices critically

The following were inspected on 2026-09-09. Links pin the evidence, not a version to install. Stars helped discovery; they do not establish security, correctness, or universal applicability.

| When it helps | Prior art |
| --- | --- |
| Compare small TUI-only behavior with explicit support and safety limits | [sagmans/pi-plan](https://github.com/sagmans/pi-plan/tree/fd746f2cb4886fed8e528fbc9479231685785008) |
| Design private local persistence, profile isolation, or migration evidence | [sagmans/pi-history](https://github.com/sagmans/pi-history/tree/3ef3b9acae41fc285b1757f8ca4eaf1a08008d8a), [sagmans/pi-stash](https://github.com/sagmans/pi-stash/tree/6467f14fffcf47e0e373b81d027b4cf437e48985) |
| Examine configuration-driven input, headless protocols, or subprocess ownership | [sagmans/pi-prefix](https://github.com/sagmans/pi-prefix/tree/c5ceef231ee6f57e5a1c919140a13dcd6b1d505a), [sagmans/pi-acp](https://github.com/sagmans/pi-acp/tree/7a61743674195298663eb229bfd03cfd6bf78d9c), [sagmans/pi-qq](https://github.com/sagmans/pi-qq/tree/cd10294228bba390f4e7dba75256e5e2d746f208) |
| Assess intentional private-host coupling and inert fallback | [sagmans/pi-ptc](https://github.com/sagmans/pi-ptc/tree/6af104fbfdbbb9f40cc8085854c6afe631d66c11) |
| Compare evidence-based delegation and multi-resource distribution | [nicobailon/pi-subagents](https://github.com/nicobailon/pi-subagents/tree/52ece5ad2c07988a67551acc53f8dc92160908b1) |
| Test protocol conformance through the actual adapter | [nicobailon/pi-mcp-adapter](https://github.com/nicobailon/pi-mcp-adapter/tree/8243eba3421e301c88c047444f34ab7d5d57163e) |
| Test a packed dependency or deferred first-use boundary | [nicobailon/pi-web-access](https://github.com/nicobailon/pi-web-access/tree/811ef82a6dd04fe4abd73fa40b079aa39ee1870d) |
| Compare packaged skills or terminal integration tests | [nicobailon/pi-messenger](https://github.com/nicobailon/pi-messenger/tree/09937ed647a1b07a3b595bf75943feacb80ff123), [nicobailon/pi-interactive-shell](https://github.com/nicobailon/pi-interactive-shell/tree/eedb89a9e4618d7416326d9387085a756a2125ee) |
| Distinguish project-local extensions from independently released workspace packages | [narumiruna/pi-extensions](https://github.com/narumiruna/pi-extensions/tree/3d15bc27d665925cbda63dc5c25647c9eb5ae13d) |

Read each project's instructions before investigating it. Its constraints are contextual, not rules to import into another target. Inspect its test seam before describing what it proves; mocked host imports and declared support ranges are not real runtime verification.

The same inventory found README-only intent in `sagmans/pi-skills` and `sagmans/pi-codemode`. They were not treated as implemented examples. Recheck repository state when a future task depends on it.
