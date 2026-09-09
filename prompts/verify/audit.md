# Audit purpose, claims, and evidence

Follow [Start](../start.md). This operation begins with inspection, not execution or repair. Establish whether the request concerns a whole project, a changeset, release readiness, or a named risk. Fix the comparison revision when reviewing a diff.

Read the target's purpose, instructions, support claims, decisions, source, configuration, and available test or CI evidence. Trace relevant behavior rather than judging file presence. Use [Pi resources](../../resources/pi.md) for host contracts and [Engineering resources](../../resources/engineering.md) for reasoned alternatives.

## Select the relevant lenses

Consider architecture and ownership; host integration and lifecycle; user experience and modes; configuration, persistence, and recovery; dependencies and trust; tests and real-use proof; package contents; CI and release controls; documentation and maintenance. Explain what is not applicable. Do not invent a missing release process for a local-only extension.

For hosted collaboration or repository-policy risks, use [Repository governance](../maintain/repository.md) to inspect effective access and protections. Local files do not prove remote settings. Record inaccessible provider state as unknown, not absent.

Prefer public Pi APIs, but assess deliberate private coupling against the target's needs, version scope, and failure behavior. A broad peer range is not proof of broad support. An existing test is evidence of intent until a relevant run establishes its result.

For every candidate finding, identify the violated target requirement or plausible consequence, cite the owning evidence, and attempt to disprove it. Distinguish actual defects from risks and preferences. Preserve strengths. Do not pad empty categories or score compliance with this reference.

## Report without changing the target

Organize the report into applicable categories:

- **Strengths:** effective practices with evidence and the value they provide.
- **Defects:** demonstrated failures against the target's purpose or requirements, with a reproducer or decisive code path.
- **Risks:** plausible failures with assumptions and the missing evidence needed to resolve them.
- **Recommendations:** contextual improvements, trade-offs, and priority; rejection does not itself create a defect.
- **Not applicable:** areas excluded for an explicit reason.
- **Unknowns:** inaccessible sources, unexecuted checks, unsupported claims, and limits of the review.

Give each actionable finding impact, confidence, location, and a safe next step. Keep sensitive findings within the target's private process through [Security review](security.md).

Propose [verification](test.md) separately, including its side effects. Do not silently install dependencies, execute repository scripts, invoke providers, alter settings, or fix files. Stop after the requested report unless the user authorizes follow-up work. Confirm the target was unchanged by the inspection.
