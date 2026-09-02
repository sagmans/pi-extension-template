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
(`dist/modes/interactive/components/custom-editor.d.ts`,
`custom-editor.js` `handleInput`).

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

The `project_trust` event is evaluated when the project directory contains
dynamic configs Pi itself loads (for example `.pi/settings.json`); an
extension-specific file such as `.pi/<extension>.json` does not trigger
evaluation, and the project is treated as trusted
(`docs/extensions.md` trust sections).

**Pitfall:** treating `ctx.isProjectTrusted()` as "the user answered a
prompt" — with no Pi-relevant config present it resolves to a default.

**Check:** start Pi in a project whose `.pi` holds only an extension config;
observe `project_trust` never firing. Add `.pi/settings.json` and a probe
extension returning `{ trusted: "no" }`; observe it firing.

## 5. Local tarball installs fail at runtime

`pi install <path>.tgz` records the tarball path in settings, but runtime
extension loading rejects it: `Unknown file extension ".tgz"`
(`docs/packages.md` describes local paths as files or directories loaded by
package rules).

**Pitfall:** packaging smoke tests that install a packed tarball pass the
install step and break on the next launch.

**Check:** extract the tarball and `pi install` the extracted directory;
that path loads.

## 6. `--no-extensions` blocks `pi install` writes

Running `pi --no-extensions install <pkg>` prints the install banner but
records nothing in settings; package installation runs through the extension
subsystem the flag disables.

**Pitfall:** automated install verification under `--no-extensions` reports
success with no effect.

**Check:** install under the flag, inspect the agent dir settings file; no
package entry exists.

## Verification harness notes

- Isolate runs: `PI_CODING_AGENT_DIR=<tmp> pi -e ./extension.ts` with a
  throwaway project directory; never repoint the real agent dir.
- Drive interactive behavior in a PTY (tmux or script). Terminal capture
  without scrollback (`tmux capture-pane` default) can hide the editor
  line; capture with `-S`.
- Use kitty-protocol-aware matching (`matchesKey`) in probe extensions;
  literal control-byte comparisons like `data === "\u0006"` fail under
  the kitty keyboard protocol.
