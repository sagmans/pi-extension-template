---
name: adopt-pi-extension-template
description: Use when setting up an empty Pi extension repository, onboarding a legacy single-extension npm package, migrating an existing extension to this blueprint, or updating a target between date-based blueprint standards.
---

# Adopt Pi Extension Template

Adapt the blueprint to an explicit target while preserving target truth. Provenance records completed verification, not intent.

## Inputs and preparation

Require an absolute target path. Resolve blueprint root from this skill. Reject the blueprint as target. Read blueprint `README.md`, target instructions, target Git state, [file ownership](references/file-ownership.md), [validation](references/validation.md), manifest schema, and applicable migrations.

If target is not empty, run `audit-pi-extension` first. Stop on multi-package or multi-extension targets.

## Target state

### Empty target

Gather package name, description, repository URL, extension purpose, imported Pi APIs, platforms, user-facing mode, configuration/storage needs, and publication intent. Adapt the executable skeleton. Keep `private: true` and release workflow inert until external setup is explicitly approved.

### Legacy target

Preserve runtime, behavior tests, domain facts, data formats, support claims, and stronger controls. Map current scripts, configs, docs, package files, and workflows to blueprint invariants. Ask one focused question for each ambiguous ownership conflict. Apply coherent atomic groups.

### Outdated target

Read every migration note after recorded `standardVersion` in chronological order. Apply required changes, reconsider recommendations, and preserve evidence-backed intentional divergence.

### Current target

Audit and stop unless user selects a specific recommendation. Current provenance does not justify unrelated cleanup.

## Verification and provenance

Follow [validation](references/validation.md). Fix evidence-backed failures at responsible layer. Write or advance `.pi-extension-template.json` only after local checks, package review, Pi load, real usage, and final diff review pass.

## Authority boundary

Report manual npm/GitHub settings separately. Do not commit, tag, push, or publish without explicit approval. Never deploy, activate publication, weaken a security gate, or mutate remote settings implicitly.

## Completion report

State target state, old/new standard date, preserved divergences, files changed, verification evidence, unresolved decisions, and external setup remaining. Failed migration leaves provenance unchanged.
