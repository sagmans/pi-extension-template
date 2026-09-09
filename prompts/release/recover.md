# Recover, deprecate, or retire

Follow [Start](../start.md). Establish whether this is an active incident, a failed release or migration, planned deprecation, or retirement. Determine the affected identities, versions, users, data, and current external state before acting.

For security incidents, use the target's private reporting channel and preserve minimal private evidence. Avoid exposing secrets, exploit details, or user data in public issues or logs. For ambiguous publishing failures, verify registry and workflow state before retrying; a reported error may follow a completed mutation.

Propose the smallest authorized containment that prevents additional harm while preserving evidence and recovery options. Credential revocation, workflow disabling, rollback, deprecation, package removal, and data restoration have distinct consequences and require the appropriate authority. Do not perform them merely because this prompt lists them.

Choose rollback versus roll-forward using actual compatibility and data evidence. A previous binary is not a safe rollback when a migration changed the data contract. Follow [Migration](../maintain/migrate.md) for recovery constraints and current provider documentation through [Engineering resources](../../resources/engineering.md) for registry limitations. Do not reuse a published version or silently move a released tag.

For planned deprecation or retirement, identify support commitments, replacement choices, installation coexistence, data retention or export, access cleanup, and communication needs. Ask about destructive retention decisions. Remove infrastructure or credentials only after verifying their ownership and remaining consumers.

Exercise the recovery or migration on disposable representative state where possible. After authorized action, verify the actual user path and external state rather than only the command exit code. Report containment, restoration, unresolved exposure, preserved evidence, and follow-up prevention separately.

End with a short evidence-backed cause or decision record and accountable next actions. Coordinate public communication through the target's policy; private validation is not approval to disclose sensitive details.
