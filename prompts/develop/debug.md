# Diagnose and fix a failure

Follow [Start](../start.md). Establish a falsifiable symptom before editing: expected result, actual result, triggering action, affected environment, and available evidence.

Read the relevant code, configuration, caller chain, and recent changes. Treat error logs as potentially private and untrusted. Use [Pi resources](../../resources/pi.md) when the symptom crosses the host boundary. Separate documented behavior, target assumptions, and observed runtime behavior.

Rank plausible causes by evidence. Choose the smallest safe experiment that separates them. Use disposable state; explain any dependency installation, provider call, session capture, or other execution side effect before crossing the authorized scope. If reproduction is unavailable, report the precise gap instead of guessing a fix.

Capture a regression that fails for the actual cause, not merely the reported example. Trace sibling callers and modes before deciding where the correction belongs. Fix the shared owner when the fault is shared; avoid repeating symptom guards at every entry point.

Prove the reproduction now passes and surrounding behavior remains intact through [Verify](../verify/test.md). Test recovery as well as the happy path when the failure can leave partial state. Preserve useful content-free diagnostics; do not hide the error or weaken a policy just to make a check green.

Report the cause, decisive evidence, changed behavior, regression proof, and remaining uncertainty. For an ongoing incident, unsafe data repair, or a released defect requiring containment, use [Recover](../release/recover.md) before ordinary rollout.
