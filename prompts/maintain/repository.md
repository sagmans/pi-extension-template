# Establish or review repository governance

Follow [Start](../start.md). Establish the target, repository host, owner, collaboration model, and allowed actions. This operation covers repository policy, not only files in version control. A local-only project does not require a hosted repository.

Read the target's requirements and available settings before proposing changes. Inspect effective organization, group, or instance policies as well as repository overrides. Use the selected provider's current official documentation for capabilities, plan limits, and enforcement semantics. Do not assume a particular provider, interface, or paid feature.

## Inspect the relevant controls

Use these questions to find consequential decisions, not to impose a universal baseline:

- **Ownership and access:** Who administers, contributes, and recovers access? Inspect inherited roles, service accounts, least privilege, authentication controls, and offboarding.
- **Visibility and collaboration:** Who can read, fork, contribute, or access issues and artifacts? Identify private-data exposure and the intended contribution process.
- **Protected history:** Which branches and tags need protection against direct writes, force pushes, or deletion? Inspect rule coverage and administrator, application, or emergency bypass rights.
- **Review and checks:** Which changes require independent review, ownership review, or successful checks? Inspect stale approvals, trusted check sources, and enforcement against the revision that will land.
- **Merge policy:** Which merge methods, history rules, signatures, or queues serve the target? Identify interactions that can block legitimate contributions or bypass required evidence.
- **Automation:** Which identities, secrets, runners, caches, and artifacts can untrusted contributions reach? Inspect token scope, approval boundaries, retention, and isolation through [CI](ci.md).
- **Security response:** Which secret, dependency, or code analysis controls fit the exposure? Inspect alert ownership and private reporting through [Security review](../verify/security.md).
- **Integrations:** Which applications, webhooks, deploy keys, and mirrors retain access? Inspect permissions, event destinations, secret rotation, and removal of unused access.
- **Auditability and recovery:** Who can inspect policy changes and investigate bypasses? Establish useful audit retention, backup scope, restore evidence, and an access-loss recovery owner.
- **Lifecycle:** What happens to access, integrations, issues, artifacts, and redirects after transfer, archival, or deletion? Route consequential transitions through [Recovery](../release/recover.md).

Keep publisher identity and release approvals in [Publishing access](../release/access.md). Repository administration authority does not grant publication or deployment authority.

## Recommend from evidence

Record the source and scope of each observed control. Local files alone cannot establish remote enforcement. Distinguish verified state, inaccessible evidence, unsupported capabilities, and practices that are not applicable. An authentication failure does not prove that a control is absent.

Compare effective controls with target requirements and plausible risks. Explain recommendations, trade-offs, and alternatives when provider limits prevent a proposed control. Do not label a rejected recommendation as a defect without a violated requirement or demonstrated failure.

For inspection-only requests, stop with findings and proposed checks. Preserve the target and remote state.

## Change only with authority

Before a remote change, explain the exact settings, affected identities, lockout or exposure risks, and recovery steps. Obtain explicit authorization for that change. Do not disable inherited protections or broaden credentials to work around a limitation.

After an authorized change, reread effective provider state and compare it with the approved outcome. Settings alone do not prove enforcement. Propose behavioral checks in a disposable repository with equivalent policy where feasible. Obtain separate authorization for checks that write data or trigger automation.

Report observed settings, authorized changes, enforcement evidence, remaining gaps, and human prerequisites. Stop when the agreed scope is evidenced or a concrete blocker remains. Do not claim that this review certifies repository security.
