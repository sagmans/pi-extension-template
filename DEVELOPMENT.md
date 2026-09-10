# Maintain the reference

There is no extension runtime or publishable package here. Read [README.md](README.md), then edit the smallest set of prompts or optional helpers that serves the requested outcome.

## Writing changes

Follow the language in [CONTEXT.md](CONTEXT.md). Keep agent guidance direct and operational: identify the decision, relevant evidence, applicable authority, and observable stopping condition. Let structure follow the operation rather than requiring a heading schema.

Keep shared orientation in [Start](prompts/start.md). Use conditional links for specialized operations and [upstream resources](resources/pi.md). Add local prose for engineering reasoning, not copies of Pi's APIs or examples. Keep tooling recommendations contextual and advisory.

Before removing old guidance, account for its useful reasoning. Preserve it in the responsible prompt or an authoritative resource pointer. Historical implementation remains in Git; do not keep a scaffold archive.

## Mechanical checks

Python 3.11 or newer and its standard library are sufficient; no dependencies need installation.

```sh
python3 -m unittest discover -s test -p 'test_*.py'
python3 scripts/check_links.py .
git diff --check
```

The helper checks local file destinations in inline Markdown links outside fenced code. It skips external URLs and anchors. It does not parse all Markdown, validate heading fragments, fetch web pages, follow symlink directories, or judge prompt quality. Keep authored internal links in that supported form; review external and fragment links separately.

The old `npm run verify:ci` contract belonged to the removed executable blueprint. The commands above and representative usage replace it. CI checks the reference, not target extension compatibility or release readiness.

A new helper needs demonstrated repeated mechanical work that native tools do not already cover more simply. Keep inputs explicit, avoid hidden project-policy assumptions, and add a failing behavioral test before implementing it. [Optional release helpers](docs/npm-release-setup.md) are a narrow approved exception for repeated publication and access checks. They use Python's standard library, native CLIs, explicit target identity, and independent action approval. Do not add generators or automatic target setup.

The release tests run real helper subprocesses against disposable targets and synthetic npm/GitHub CLIs. They never publish or change remote controls. Their passing result does not prove live 2FA, OIDC delivery, or provider availability. After a helper change, exercise safe native read-only checks where credentials permit. Report missing live evidence explicitly.

## Representative usage

For changes to the entry method, setup, or audit, follow the prompts as an agent would:

1. Choose a disposable target and a small explicit extension outcome. Follow Start and Setup, consult the matching Pi resources, derive the implementation, and exercise its actual host entry and user action. Record prerequisites, decisions, checks, and cleanup. Do not copy a sample from this reference.
2. Select an existing target with different conventions. Capture its initial tracked and untracked state, follow Start and Audit without executing its code, and produce evidence-backed strengths, problems, recommendations, and unknowns. Confirm the target remains unchanged.
3. Review release preparation with an unmet authority or identity precondition. Confirm it stops without publication or remote mutations.

Review the relevant operation routes, external resources, and advice-versus-requirement boundaries. Report what was actually exercised; these examples do not prove every prompt works in every agent harness. If a real-use check cannot run, provide exact user-run steps and the expected result instead of claiming completion.

Store research, plans, and usage evidence under ignored `artifact/` or outside the repository. Use synthetic data and exclude personal paths, real session data, and credentials from shared reports. Follow [Security](SECURITY.md) for sensitive findings. No commit or remote delivery follows automatically from successful checks.
