# File Ownership

| Class | Treatment | Examples |
| --- | --- | --- |
| Preserve | Keep behavior and facts; refactor only with separate proof. | Runtime, feature tests, domain model, data formats, support claims, privacy facts. |
| Adapt | Translate blueprint invariant to target identity and capabilities. | Package metadata, peers, scripts, package allowlist, CI matrix, README, diagnostics/config/storage docs. |
| Replace with approval | Use generic blueprint form when target has no stronger or meaningful local policy. | Formatter/type/test config, generic CI shell, generic issue templates. |
| Never copy | Exclude reference identity and safety state from release-ready target. | Blueprint name/URLs, reference-only claims, private guard after approved publication setup. |

When ownership is ambiguous, show target evidence and ask one focused question. Never resolve ambiguity by overwriting target content.
