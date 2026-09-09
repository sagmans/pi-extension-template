# Migrate without losing the target's contract

Follow [Start](../start.md). Identify the old and proposed contracts, affected consumers, existing data, concurrent users, supported upgrades, and downgrade expectations. Migration can concern a host version, API, configuration, storage format, package identity, or deployment—not a reference version marker.

Read the owner of each contract and its relevant [Pi or external resources](../../resources/pi.md). Distinguish documented promises from accidental behavior. Resolve identity and ambiguity before transforming anything: a lossy historical key or ambiguous package name is not evidence that two objects are the same.

Propose the smallest transition that meets the owner's needs. Explain cutover versus compatibility support, prerequisites, recoverability, backups, retained data, and irreversible steps. Compatibility layers have a cost; add them for an actual support requirement, not automatically.

For durable state, reason about interrupted writes, repeated execution, concurrent old and new clients, invalid or future versions, ownership, and partial migration. Preserve unrecognized or conflicting data for private review rather than guessing a repair. For package renames, account for duplicate installation and unchanged user-data identity. For host changes, verify the target's actual integration instead of inferring compatibility from the version number.

Implement only the authorized transition and prove it with synthetic representative fixtures. Exercise failure, retry, and recovery paths as well as the happy path through [Verify](../verify/test.md). Test the promised rollback or state explicitly when downgrade cannot be safe.

Report converted and untouched categories, evidence, unresolved cases, rollout order, and the point of no return. Stop before real data changes or external cutover not covered by authorization. Use [Recover](../release/recover.md) for an already failed migration or incident.
