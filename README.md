# Pi Extension Reference

A linked prompt library for AI agents developing Pi extensions in other repositories.

**Advisory reference.** Reading the prompts performs no setup or publication. There are no project scaffolds to copy. Agents learn from Pi's resources, explore the target, interview the user, and derive an appropriate implementation. [Optional npm release helpers](docs/npm-release-setup.md) can operate on an explicitly selected target, with separate approval for every remote action.

Recommendations are advisory. They do not impose a stack, project layout, support matrix, or compliance score. The target's requirements and the user's authorization govern the work.

## Start with an outcome

Give your agent access to this reference and identify the target repository and desired outcome. It need not run from this repository or install a skill.

> Read the reference's start guide, then follow its setup prompt for my target. Explore and learn first. Explain consequential choices before asking me. Create a tailored working project, not a copy of the reference.

> Read the reference's start guide, then audit my target against its purpose and claims. Inspect only. Report strengths, defects, risks, recommendations, and missing evidence. Propose execution checks separately.

Begin with [Start](prompts/start.md). Then choose [Set up a project](prompts/discover/setup.md) or [Audit a project](prompts/verify/audit.md). If an agent receives a deep-linked prompt first, it should follow that prompt's Start link before acting.

## Find the operation

| Outcome | Prompt |
| --- | --- |
| Establish a usable new or unfinished project | [Set up](prompts/discover/setup.md) |
| Choose scope, boundaries, and host integration | [Design](prompts/discover/design.md) |
| Add or change behavior | [Implement](prompts/develop/implement.md) |
| Reproduce a failure and fix its cause | [Debug](prompts/develop/debug.md) |
| Simplify without changing behavior | [Refactor](prompts/develop/refactor.md) |
| Reduce measured latency, resource use, or context cost | [Improve performance](prompts/develop/performance.md) |
| Design tests and prove actual use | [Verify](prompts/verify/test.md) |
| Assess an existing project or changeset | [Audit](prompts/verify/audit.md) |
| Investigate trust boundaries and supply-chain risk | [Review security](prompts/verify/security.md) |
| Check the distributable artifact | [Verify packaging](prompts/verify/package.md) |
| Establish or review repository access, protections, and governance | [Configure repository governance](prompts/maintain/repository.md) |
| Choose or repair CI | [Work on CI](prompts/maintain/ci.md) |
| Research and update dependencies or host versions | [Update dependencies](prompts/maintain/dependencies.md) |
| Change data, configuration, APIs, or distribution identity | [Migrate](prompts/maintain/migrate.md) |
| Align documentation, agent guidance, and collaboration | [Document](prompts/maintain/document.md) |
| Triage issues and recurring maintenance | [Maintain](prompts/maintain/triage.md) |
| Establish or review package ownership and publishing access | [Configure publishing](prompts/release/access.md) |
| Assess release readiness without publishing | [Prepare a release](prompts/release/prepare.md) |
| Publish an approved package and verify delivery | [Publish](prompts/release/publish.md) |
| Deliver a service when an extension actually needs one | [Deploy](prompts/release/deploy.md) |
| Respond to a failed release, incident, deprecation, or retirement | [Recover](prompts/release/recover.md) |

These are entry routes, not mandatory lifecycle phases. Follow only relevant links. Pi APIs belong in [upstream resources](resources/pi.md), not in a second local manual. Tool choices and community examples live in [Engineering resources](resources/engineering.md).

## Maintain this reference

[Development](DEVELOPMENT.md) explains local checks and representative usage. [Agent instructions](AGENTS.md) govern edits here, not other repositories. [Domain language](CONTEXT.md) defines the terms used by the prompts. [Architecture decisions](docs/adr/0003-advisory-reference.md) explain the conversion; [changelog](CHANGELOG.md) preserves history.

Report sensitive findings through [Security](SECURITY.md). [Contribution policy](CONTRIBUTING.md) is unchanged. This library is available under the [MIT License](LICENSE).
