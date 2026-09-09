# Simplify while preserving behavior

Follow [Start](../start.md). Identify the concrete maintenance problem: mixed ownership, repeated policy, difficult change, dead flexibility, or an obscured contract. A preferred style alone does not justify broad restructuring.

Map the affected callers, external interfaces, persisted formats, and target conventions. State what must remain observable. Characterize behavior at the highest existing seam before moving responsibilities.

Compare deletion, inlining, consolidation, and reuse before introducing a new abstraction. Keep policy with its owner. Preserve error behavior, side effects, performance constraints, and supported host integration. Consult [Pi resources](../../resources/pi.md) rather than rebuilding a capability the host already provides.

Make small reversible changes and run the relevant checks between them. If the desired simplification changes user behavior or compatibility, stop calling it a refactor: use [Design](../discover/design.md) or [Migration](../maintain/migrate.md) to resolve that choice explicitly.

Use [Verify](../verify/test.md) on the same observable contract before and after. Review whether the result actually reduces maintenance cost, not just line count. Report the preserved behavior, the removed complexity, and any unverified equivalence. Stop once the stated maintenance problem is resolved.
