# ADR 0001: Executable Non-Publishing Blueprint

## Status

Superseded by [ADR 0003](0003-advisory-reference.md). Originally accepted 2026-08-27. The decision below is historical, not current operating guidance.

## Decision

Keep a runnable empty extension, package metadata, tests, and active CI at repository root. Keep the package private and every release workflow inert with an `.example` suffix.

## Rationale

Executable examples expose drift that prose-only templates hide. Private package metadata and inactive publication automation make the reference safe to validate without turning it into a distributable product.

## Consequences

Agents adapt identity, package allowlist, runtime code, support claims, and release setup for each target. This repository can prove packaging and Pi loading but cannot prove target-specific behavior or publish itself.
