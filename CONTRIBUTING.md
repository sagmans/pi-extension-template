# Contributing

This repository is a general reference and does not accept contributions. Anyone may use and adapt it under the [MIT License](LICENSE).

For private vulnerability reporting, follow [Security](SECURITY.md). Maintainers follow [Development](DEVELOPMENT.md) when changing the reference. Target repositories define their own participation policy; this file is not a template to copy.

## Git hooks

Checks run in tracked local Git hooks instead of push/PR CI. Enable them once per clone:

```sh
sh scripts/setup-hooks.sh
```

Each hook runs your global Git hook of the same name first (if any), then this repository's checks:

- `pre-commit`: staged whitespace and conflict-marker check.
- `pre-push`: unit tests and link check.
