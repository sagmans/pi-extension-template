# Pi Extension Reference Language

This glossary distinguishes the current advisory reference from the historical executable blueprint.

## Reference language

**Reference library**:
A non-publishing collection of prompts and engineering knowledge that guides agents through Pi extension work in other repositories.
_Avoid_: Template generator, compliance framework

**Target**:
An existing or future Pi extension project selected by the user for inspection or authorized changes.
_Avoid_: Copy of the blueprint

**Operation prompt**:
Guidance organized around a user outcome, such as setup, feature work, audit, or release, with pointers to relevant learning and decisions. A separate Pi API is not by itself a separate operation.
_Avoid_: Fixed project recipe, self-contained manual, API tutorial

**Recommendation**:
Advice supported by reasons and trade-offs that the user can accept, adapt, or reject. A reference recommendation does not itself establish a blocking requirement.
_Avoid_: Mandatory baseline, required drift

**Project requirement**:
An obligation established by the target's own instructions, the user's agreed outcome, or applicable execution constraints. It does not originate solely from a reference recommendation.
_Avoid_: Reference compliance rule

**Adaptive interview**:
A task-focused conversation that follows exploration and resolves consequential unknowns before action. It revisits settled choices only when new evidence changes the decision.
_Avoid_: Mandatory lifecycle questionnaire

**Audit**:
An inspection-first assessment of a target against its purpose, stated claims, and available evidence. It identifies strengths, defects, risks, and contextual recommendations rather than compliance with the reference.
_Avoid_: Blueprint compliance check, reference score

**Audit verification**:
A check proposed to resolve missing audit evidence, with its execution and side effects distinguished from read-only inspection.
_Avoid_: Assumed test pass, automatic repair

**Not applicable**:
An audit classification for a practice or lifecycle area that does not serve the target's purpose or present needs.
_Avoid_: Missing requirement

**Upstream Pi resource**:
Pi-maintained documentation, examples, or public API definitions that explain the host's behavior. The reference points to these resources instead of reproducing their content.
_Avoid_: Bundled Pi manual, copied API guide

**Entry point**:
The starting guide that explains the reference's approach and leads the agent to relevant operation prompts.
_Avoid_: Required installation

**Resource pointer**:
A link to internal guidance or an upstream resource, with the task or question that makes the resource relevant.
_Avoid_: Local copy of upstream documentation

**Linked reference**:
An entry point and connected operation prompts that let an agent discover the material relevant to its task.
_Avoid_: Bundle of standalone manuals

**Evidence gap**:
A question that available sources or verification cannot resolve. The agent states the gap, continues supported work, and asks the user when the uncertainty affects a consequential decision.
_Avoid_: Invented guarantee, assumed test pass

**Generic helper**:
An optional script for demonstrated, repeated mechanical work whose inputs and outputs remain useful across targets. It does not choose project policy implicitly. Provider-specific release helpers declare their supported contracts, require explicit target choices, and stop on unknown responses.
_Avoid_: Setup generator, scripted engineering judgment

**Community prior art**:
An extension's documented choices or implementation evidence that helps an agent compare approaches. Popularity does not establish correctness, security, or applicability to another target.
_Avoid_: Official host contract, universal best practice

## Historical blueprint language

**Blueprint**:
The executable reference that preceded the advisory reference design.

**Blueprint target**:
A single-extension npm project inspected or adapted under the former blueprint standard.

**Standard version**:
The date that identifies an adopted blueprint contract.

**Adoption**:
The first application of the former blueprint to an empty or existing project.

**Standard migration**:
An ordered transition between recorded blueprint standards.

**Required drift**:
A difference classified as a violation of an invariant under the former blueprint standard.

**Intentional divergence**:
An evidence-backed target choice that the former blueprint treated as a valid difference from its standard.

**Blueprint provenance**:
The historical record of a target's verified adoption of a blueprint standard.

**Publication boundary**:
The former blueprint's approved signed-tag and npm trusted-publishing release boundary.
