# Deploy only a required service

Follow [Start](../start.md). Confirm that the extension actually has a deployable component. A local Pi extension or npm package does not need cloud infrastructure merely to complete a lifecycle checklist.

Identify the service, target environment, owner, data and credential boundaries, consumers, and deployment authority. Read the target's existing delivery process and current provider documentation. Preserve a suitable platform instead of introducing a new one.

Establish the observable readiness conditions: versioned artifact, configuration, compatible dependencies, migration order, health checks, access controls, rollback or roll-forward path, and user-visible acceptance. Use [Migration](../maintain/migrate.md) for state transitions and [Security review](../verify/security.md) for relevant trust changes.

Prove the delivery path in an authorized non-production environment with synthetic data. Distinguish startup health from the real integration outcome. Check failure handling, diagnostics, and recovery. Keep production credentials and user data out of rehearsals.

Explain the exact environment and consequences before any deployment not already authorized. Deliver through the target's approved mechanism, then observe the rollout and verify the intended user path. Do not treat an accepted job or healthy container as complete end-to-end proof.

Report what changed, observed version and health, actual usage evidence, residual risk, and the recovery decision. If the deployment fails or leaves partial state, use [Recover](recover.md); do not retry or roll back blindly across incompatible data changes.
