# Learn Pi from Pi

Use this resource map from [Start](../prompts/start.md) when a decision depends on host behavior. It supplies reading routes, not a substitute API manual.

## Establish the evidence version

Read the target's declared support, resolved development dependencies, installed host version, and available usage evidence separately. Use the [official documentation index](https://pi.dev/docs/latest) to locate current material and the [official releases](https://github.com/earendil-works/pi/releases) to investigate changes.

The canonical source repository is [earendil-works/pi](https://github.com/earendil-works/pi). Resolve the following source paths at the target's relevant release or installed package, rather than assuming the default branch describes it. The links below are discovery links to the moving default branch.

| Question to resolve | Read upstream |
| --- | --- |
| What resource should exist, and how does Pi discover or load it? | [Package and resource distribution](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md) |
| Which public capability and lifecycle can implement the outcome? | [Extensions](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md), then a relevant [extension example](https://github.com/earendil-works/pi/tree/main/packages/coding-agent/examples/extensions) |
| How should terminal UI compose with the host? | [TUI](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/tui.md), [keybindings](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/keybindings.md), [themes](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/themes.md) |
| What survives session changes or compaction? | [Sessions](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sessions.md), [session format](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/session-format.md), [compaction](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/compaction.md) |
| What configuration and profile boundaries already exist? | [Settings](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/settings.md), [environment variables](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/environment-variables.md) |
| Is an SDK embedding or protocol integration needed? | [SDK](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sdk.md), [RPC](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/rpc.md), [JSON mode](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/json.md) |
| Is this agent guidance rather than runtime behavior? | [Skills](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md), [prompt templates](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/prompt-templates.md) |
| Does the task require model or provider integration? | [Providers](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/providers.md), [models](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/models.md), [custom providers](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/custom-provider.md) |
| What are the host's trust and isolation boundaries? | Security and containerization topics in the [official index](https://pi.dev/docs/latest) |

## Resolve uncertain behavior

Read the complete relevant contract and example, not a search snippet. Check exported types and installed implementation when the documentation leaves a consequential ambiguity. Record the revision and what was observed. Private or experimental code is evidence of that implementation, not a public compatibility promise.

Prefer a public capability that satisfies the outcome. If it does not, explain the unmet need and the cost of private coupling before recommending an alternative. Any claimed supported version still needs appropriate evidence through [verification](../prompts/verify/test.md).

If a link moves, use the official index or repository tree to find the owner-maintained replacement. Do not create a local copy of the missing manual. Keep version-sensitive findings in the target's relevant issue or decision record with their evidence and recheck trigger.
