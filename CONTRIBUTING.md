# Contributing

This repository is a general reference and does not accept contributions. Anyone may use and adapt it under the [MIT License](LICENSE).

For private vulnerability reporting, follow [Security](SECURITY.md). Maintainers follow [Development](DEVELOPMENT.md) when changing the reference. Target repositories define their own participation policy; this file is not a template to copy.

## Git hooks

Checks run in tracked local Git hooks instead of push/PR CI. Run `scripts/setup-hooks` once after cloning; it points this clone's `core.hooksPath` at `.githooks`. Each hook runs the generic checks first (sign-off and commit message format, a gitleaks secret scan, and signed, signed-off commits on push), then this repository's checks in `.githooks/<hook>.d/` in name order. Install [gitleaks](https://github.com/gitleaks/gitleaks) first. Every check must pass before you push; never use `--no-verify`. Pre-push checks test exactly each pushed commit: in place only when it is the clean, unmodified checkout, otherwise in a temporary worktree of that commit.

This repository's checks:

- `pre-commit`: staged whitespace and conflict-marker check.
- `pre-push`: unit tests and link check.
