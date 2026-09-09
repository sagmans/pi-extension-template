# Select verification and prove real use

Follow [Start](../start.md). Translate each important claim into an observable pass condition. Select the highest useful existing seam; add lower-level tests only where they resolve a meaningful failure risk.

## Match the proof to the claim

Inspect the target's current tests and documented commands before proposing tools. Separate a test's existence from an executed result. A mocked host proves the exercised logic, not host compatibility; a package listing proves membership, not runtime behavior.

For each relevant outcome, identify the happy path, boundaries, failures, and recovery that matter. Prefer deterministic synchronization over sleeps. Keep expected results independent of the implementation so a regression can actually fail the test.

Use [Pi resources](../../resources/pi.md) to select supported loading and interaction modes. Verify declared versions and platforms only to the extent evidence supports them; distinguish typechecking, contract tests, and actual runtime results.

## Run in disposable state

Describe execution side effects and required authority. Isolate user/profile directories, configuration, sessions, storage, ports, subprocesses, and credentials where applicable. Use synthetic inputs; do not read real prompt history or draft stores as fixtures. Prevent inherited context from attaching the test to the driving agent's session.

Exercise the actual entry point and affected user action. For TUI behavior, use a real terminal path and effective keybindings; for headless behavior, inspect protocol output, errors, and lifecycle. Follow reload, restart, resume, fork, cancellation, concurrency, and cleanup only where the target claims those behaviors.

For shipped code, test the [actual package artifact](package.md), including first use of lazy or built resources. Use local fixtures for network integrations where possible. A live provider check needs appropriate authorization and an explicit cost/data boundary.

## Close the evidence gap

Record the command or reproducible interaction, environment, expected result, observed result, and cleanup outcome. Keep sensitive raw captures private. A timeout, early exit, or missing prerequisite is not a pass.

If a real-use check is unavailable, identify exactly what remains unproven and give minimal user-run steps with the expected result. Do not present the operation as fully verified. Hand off to [Debug](../develop/debug.md) for an unexplained failure rather than weakening the check.
