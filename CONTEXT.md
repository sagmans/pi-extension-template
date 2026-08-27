# Domain Language

| Term | Meaning |
| --- | --- |
| Blueprint | This non-publishing executable reference repository. |
| Target | New or existing single-extension npm repository being inspected or adapted. |
| Standard version | ISO date identifying the last fully adopted blueprint contract. |
| Adoption | First application of the blueprint to an empty or legacy target. |
| Migration | Ordered transition from one recorded standard date to a later date. |
| Required drift | Target difference that violates a security, packaging, verification, or declared compatibility invariant. |
| Recommendation | Beneficial practice that is not required for the target's declared behavior. |
| Intentional divergence | Evidence-backed target-specific choice that remains valid and should be preserved. |
| Provenance | `.pi-extension-template.json` record written only after successful verification. |
| Publication boundary | Explicitly approved signed-tag push and approval-gated npm OIDC workflow. |

The blueprint is not a shared runtime dependency, generator, deployed service, or release artifact.
