# Contributing

Use public issues only for non-sensitive bugs and proposals. Follow [SECURITY.md](SECURITY.md) for vulnerabilities or private data exposure.

Before a pull request:

1. Explain user intent and bounded scope.
2. Add regression or feature proof before implementation when behavior changes.
3. Run `npm run verify:ci` and target-specific real usage.
4. Review package-content, security/privacy, documentation, compatibility, and release impact.
5. Keep generated output, credentials, prompts, sessions, and personal paths untracked.

Use focused branches and reviewable commits. Adapt signing and DCO requirements to the target's governance; this blueprint's maintainers require signed DCO commits. Release preparation follows [RELEASE.md](RELEASE.md) and remains separate from feature work.
