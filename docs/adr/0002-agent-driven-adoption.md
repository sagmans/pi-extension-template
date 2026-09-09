# ADR 0002: Agent-Driven Adoption

## Status

Superseded by [ADR 0003](0003-advisory-reference.md). Originally accepted 2026-08-27. The decision below is historical, not current operating guidance.

## Decision

Use repository-local agent skills for audit and adoption. Maintainers invoke them manually from this blueprint against an explicit target path.

## Rationale

Public extensions legitimately differ in platforms, package resources, storage, UI mode, diagnostics, and governance. Reviewable agent changes can preserve those facts. A generator or central synchronization service would either erase divergence or require a complex merge protocol.

## Consequences

Updates are deliberate rather than automatic. Date provenance and ordered migration notes make state visible. The skills need strong read-only and approval boundaries, and maintainers remain responsible for reviewing diffs and external npm/GitHub settings.
