# Contributing

This repository is a general reference and does not accept contributions. Anyone may use and adapt it under the [MIT License](LICENSE).

For private vulnerability reporting, follow [Security](SECURITY.md). Maintainers follow [Development](DEVELOPMENT.md) when changing the reference. Target repositories define their own participation policy; this file is not a template to copy.

## Git hooks

Checks run in tracked local Git hooks instead of push/PR CI. The scripts live in `.githooks/<hook>.d/` and run through the global dotf hooks: the global check runs first, then each script in name order. There is no per-clone setup and no repo-local `core.hooksPath`; if an older setup left one, remove it with `git config --local --unset core.hooksPath`. Repository hooks run only after you review this clone's `.githooks` and trust it with `githooks-trust`; until then only the global checks run. Pre-push checks test exactly each pushed commit: in place only when it is the clean, unmodified checkout, otherwise in a temporary worktree of that commit.

This repository's checks:

- `pre-commit`: staged whitespace and conflict-marker check.
- `pre-push`: unit tests and link check.
