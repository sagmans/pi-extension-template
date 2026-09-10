# ADR 0004: Optional Release Helpers

## Status

Accepted. Refines [ADR 0003](0003-advisory-reference.md) without restoring the executable blueprint.

## Decision

Retain optional helpers for repeated npm publication and GitHub access operations demonstrated by pi-history. Use independent actions with explicit target identity, reviewed artifact integrity, preview output, and action-specific approval.

Use the reference's existing Python standard library rather than importing pi-history's shell suite and YAML dependency. Native npm and GitHub CLIs remain the provider interfaces. Keep workflow review manual and explicit. Keep runtime testing, source review, release policy, and authority with the target.

## Consequences

The reference can now execute approved release operations when a user explicitly invokes an optional helper from a target. Reading prompts and maintaining this repository still performs no target setup or publication.

Provider contracts require maintenance. Tests cover subprocess behavior using synthetic responses and disposable targets, not live publication authority or OIDC delivery. Conflicting remote controls require review instead of automatic replacement. The helpers never generate a project scaffold or become a mandatory audit baseline.

The [setup guide](../npm-release-setup.md) owns the supported provider scope, inputs, failure handling, and evidence limits.
