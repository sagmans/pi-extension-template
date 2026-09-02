# Host Pitfalls

Host integration failure modes verified while shipping a real extension
(`@sagmans/pi-prefix`, PR #1). Scope: `@earendil-works/pi-coding-agent`
`0.84.4`. Each entry cites the installed package tree (paths relative to the
package root) and a reproducible check. Re-verify entries before treating them
as current on newer Pi lines.

## 1. Registered shortcuts reach editors only through `onExtensionShortcut`

`pi.registerShortcut(shortcut, { handler })` does not invoke `handler` from a
global dispatch table. The host routes the keystroke to the active editor's
`onExtensionShortcut?: (data: string) => boolean` callback
(`dist/modes/interactive/components/custom-editor.d.ts`; dispatched at the
top of `handleInput` in `dist/modes/interactive/components/custom-editor.js`).

**Pitfall:** an extension that replaces the editor component but delegates
input without first consulting `this.onExtensionShortcut?.(data)` silently
breaks every shortcut registered through `pi.registerShortcut` — including
its own.

**Check:** register a shortcut that activates extension state, send its key
through a wrapped editor, assert the state changed.

## 2. `KeybindingsManager` is injected only into editor/custom factories

The authoritative keybinding manager (TUI bindings plus app actions merged) is
handed to `(tui, theme, keybindings) =>` factories of
`ctx.ui.setEditorComponent` and `ctx.ui.custom(...)`
(`docs/extensions.md` "Custom editors and `ctx.ui.custom()` components
receive `keybindings: KeybindingsManager` as an injected argument"). The
merged `KEYBINDINGS` table is not exported from the package root, and
extension contexts expose no `ctx.keybindings`.

**Pitfall:** conflict detection or key lookups attempted at
`session_start` have no manager; they must run inside the factory, once per
session.

**Check:** attempt any keybinding read outside a factory; it is unavailable.

## 3. `pi.events` is the inter-extension bus; `pi.on` is Pi lifecycle only

`pi.events.on(name, handler)` / `pi.events.emit(name, data)` share a
synchronous `EventEmitter` between extensions
(`dist/core/event-bus.d.ts`). `pi.on(event, handler)` subscribes to Pi's
own lifecycle events (`session_start`, `tool_call`, ...). The two are not
interchangeable.

**Pitfall:** an extension emitting on the bus while the receiver listens via
`pi.on` (or vice versa) produces silently missing messages.

**Check:** emit a named event from one `-e` extension and assert receipt in
another via `pi.events.on`.

## 4. `project_trust` fires only for Pi-relevant dynamic configs

Trust resolution checks a fixed whitelist of host-relevant resources before
anything else: `TRUST_REQUIRING_PROJECT_CONFIG_RESOURCES`
(`settings.json`, `extensions`, `skills`, `prompts`, `themes`,
`SYSTEM.md`, ...) under `<CONFIG_DIR_NAME>/`, plus any
`.agents/skills` directory up the tree
(`dist/core/trust-manager.js`, `hasTrustRequiringProjectResources`).
When no whitelisted resource exists, `resolveProjectTrusted` returns
`true` immediately — before the `project_trust` event, before the stored
decision, before any prompt (`dist/core/project-trust.js`). An
extension-specific file such as `.pi/<extension>.json` is not on the
whitelist and never triggers evaluation.

**Pitfall:** treating `ctx.isProjectTrusted()` as "the user answered a
prompt" — with no whitelisted resource present the project is trusted by
default and `project_trust` never fires.

**Check:** start Pi in a project whose `.pi` holds only an extension config
and log `project_trust` plus `ctx.isProjectTrusted()` from a probe
extension: the event never fires, trust is `true`. Add
`.pi/settings.json` and a probe returning `{ trusted: "no" }`: the event
fires and trust flips.

## 5. Local tarball installs fail at runtime

`pi install <path>.tgz` resolves the local path and persists it into
settings (`dist/core/package-manager.js`, `installAndPersist`); local
files then load as single extensions per `docs/packages.md`. Runtime tries
to load the tarball path as a module and Node's ESM loader rejects it with
`Unknown file extension ".tgz"` — the recorded package is unloadable.

**Pitfall:** packaging smoke tests that install a packed tarball pass the
install step and break on the next launch.

**Check:** with an isolated agent dir, first reproduce the failure —
`pi install <pkg>.tgz`, then start Pi and observe the
`Failed to load extension` / `.tgz` error. Then extract the tarball and
`pi install` the extracted directory; that path loads and the extension
activates.

## 6. Package subcommands must be the first CLI argument

Package-command dispatch reads only `args[0]`
(`dist/package-manager-cli.js`, `parsePackageCommand`: recognized
subcommands are `install`, `remove`/`uninstall`, `update`, `list`).
`pi --no-extensions install <pkg>` therefore never dispatches the install:
`--no-extensions` is parsed as a normal-session flag and
`install <pkg>` is treated as prompt text. Conversely,
`pi install <pkg> --no-extensions` parses the subcommand but rejects the
flag as unknown for it (`Unknown option --no-extensions for "install"`,
same file).

**Pitfall:** automation that prefixes global flags before package
subcommands runs a normal agent session instead of installing; the
"installation" never happened. (The normal session itself may fail or touch
the network depending on configuration — that is unrelated to the missed
dispatch.)

**Check:** offline (`PI_OFFLINE=1`), in a throwaway agent dir, run
`pi --no-extensions install <pkg-dir>` with stdin closed; the process may
exit zero or non-zero — assert only that no install progress printed and the
settings file has no package entry. Then run `pi install <pkg-dir>
--no-extensions`: it exits non-zero with the unknown-option error.

## Verification harness notes

- Isolate runs: `PI_CODING_AGENT_DIR=<tmp> pi -e ./extension.ts` with a
  throwaway project directory; never repoint the real agent dir.
- Drive interactive behavior in a PTY (tmux or script). Terminal capture
  without scrollback (`tmux capture-pane` default) can hide the editor
  line; capture with `-S`.
- Use kitty-protocol-aware matching (`matchesKey`) in probe extensions;
  literal control-byte comparisons like `data === "\u0006"` fail under
  the kitty keyboard protocol.
