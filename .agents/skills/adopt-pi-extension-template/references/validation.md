# Target Validation

Run in order:

1. Clean dependency install with lifecycle scripts disabled when compatible.
2. Biome format/lint check.
3. Strict TypeScript check.
4. Unit/integration tests and global 80% coverage or stronger.
5. High/critical dependency audit and exception validation.
6. npm dry-run package allowlist.
7. Pack one tarball, isolate-install it, and load declared entrypoint through Pi.
8. Target-specific real user workflow documented by target.
9. Final Git diff/status review for identity leakage, private data, generated output, and unrelated change.
10. Manual npm/GitHub settings report.

Provenance updates only after steps 1–9 pass. Step 10 can remain external work, but publication stays inert until an owner completes it. A failed step records evidence and leaves provenance unchanged.
