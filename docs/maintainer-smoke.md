# Maintainer Package Smoke

`npm run smoke` creates one tarball, installs that exact artifact and pinned Pi in a temporary isolated prefix, resolves the declared package entrypoint, runs Pi with `--list-models`, detects extension-load errors, and removes temporary files.

Run:

```bash
npm ci --ignore-scripts
npm run smoke
```

Success identifies the tarball and installed entrypoint with exit code zero. The smoke never invokes a model or needs provider credentials. It proves packaging and Pi loadability, not extension-specific user behavior. Adapted targets must separately perform documented real usage.
