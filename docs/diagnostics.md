# Diagnostics Guidance

> **Adapt or remove:** retain this document only when the target exposes user-facing diagnostics.

Define diagnostics that answer operational questions without exposing prompts, session text, secrets, usernames, personal paths, or raw stored data.

Document:

- Stable diagnostics schema/version
- Healthy, degraded, unavailable, and unsupported states
- Initialization and dependency status
- Bounded counts and limits rather than private values
- Exact user command and safe example output
- Recovery action for every non-healthy state
- Compatibility behavior when optional Pi APIs or modes are unavailable

Tests should lock public field names, redaction, bounded output, and failure-state mapping.
