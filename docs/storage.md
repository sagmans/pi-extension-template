# Storage Guidance

> **Adapt or remove:** retain this document only when the target persists data.

Document ownership, scope identity, paths, schemas, permissions, retention, size limits, concurrency, atomicity, crash recovery, corruption handling, migration, downgrade behavior, backup, and deletion.

Treat stored prompts, drafts, sessions, and paths as private plaintext unless encryption is explicitly implemented and verified. Prefer private permissions, atomic replacement, bounded locking, quarantine over destructive recovery, and reversible migrations. Test interruption, malformed data, unsafe ownership, symlinks, conflicting writers, cleanup failure, and old/new version transitions.
