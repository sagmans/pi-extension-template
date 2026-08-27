# Security Policy

## Reporting

Do not report vulnerabilities in public issues. Use the repository owner's private security advisory channel or private contact configured by the adapted target. Include minimum reproduction evidence and redact prompts, session files, secrets, tokens, usernames, and personal paths.

## Trust boundary

Pi extensions are not sandboxed. They execute with the user's full local permissions. Skills can direct agents to perform privileged actions. Installation, project trust, dependency changes, configuration files, external processes, network access, and release credentials are security boundaries.

## Supported versions

An adapted target must replace this section with its currently supported released versions. The reference blueprint itself has no released version.

## Handling

Maintainers privately reproduce the report, assess affected versions and abuse paths, prepare a focused fix and regression proof, audit package contents, and coordinate disclosure. High/critical dependency findings block CI unless a reviewed, accountable, expiring exception exists. Never commit security-sensitive evidence or copy it into public automation logs.
