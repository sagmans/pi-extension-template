# Establish or review publishing access

Follow [Start](../start.md). This operation concerns identity and authority, not package publication. First establish whether distribution is needed, the intended registry, package identity, owner, repository, and existing publication state.

Inspect authorized read-only account and package metadata. Distinguish absence from authentication, authorization, rate-limit, or network failure. Use the same explicit registry identity throughout the investigation and subsequent approved actions. Never print credentials or infer a secret from private configuration.

Read current registry and CI documentation through [Engineering resources](../../resources/engineering.md), plus installed CLI help. Provider schemas and permissions change. If sources disagree, describe the contradiction and seek current evidence rather than encoding either claim as a universal setup script.

Separate the decisions:

- Who may publish, administer access, and approve releases?
- What is needed for first publication, and what should recurring releases use?
- Can trusted publishing replace long-lived credentials for this target? Which provider, workflow identity, environment, and runner are actually supported?
- Should automation publish directly or stage an artifact for a separate approval? What recovery path remains if the chosen mechanism fails?
- Which least-privilege, two-factor, token, and provenance controls fit the target's needs and current capabilities?

Explain each proposed mutation, identity, consequence, and recovery option before obtaining the required authorization. Prefer native CLI surfaces over bespoke API wrappers. If bootstrap requires a first publication, hand off to [Prepare](prepare.md) and [Publish](publish.md); setup authority alone is not publication authority.

After an authorized access change, reread provider state and compare it with the intended contract. Report what was configured, what was merely proposed, and what still requires human authentication or approval. Do not claim that a configuration check proves a successful real OIDC publication, and do not silently fall back to a broader credential.
