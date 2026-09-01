# Configuration Guidance

> **Adapt or remove:** retain this document only when the target has configuration.

Document the authoritative path, trust boundary, schema, defaults, precedence, reload behavior, unsupported fields, and safe failure mode. Keep mutable user configuration outside installed package files so updates do not erase it.

Configuration parsing should reject unsafe files and dangerous ambiguity, preserve user data, avoid secret logging, and report actionable errors. Tests should cover missing, valid, malformed, partially specified, legacy, untrusted-project, and concurrent-update cases.
