# Blueprint Manifest

`.pi-extension-template.json` records target provenance without coupling a target repository to shared runtime code or remote automation.

## Contract

The manifest has exactly four required fields and accepts no additional fields:

| Field | Contract |
| --- | --- |
| `standardVersion` | ISO calendar date (`YYYY-MM-DD`) naming the last fully adopted blueprint standard. |
| `platforms` | Non-empty, duplicate-free array containing only `linux`, `macos`, or `windows`. |
| `nodePolicy` | Fixed value `current-lts`. |
| `packageShape` | Fixed value `single-extension`. |

A missing manifest identifies a legacy target. It does not prove that the target is unsafe or nonconforming.

## Update rule

Write or advance `standardVersion` only after every ordered migration through that date has completed and successful verification has covered formatting, linting, types, tests, coverage, dependency audit, package contents, and isolated Pi loading. Failed or partial migration leaves provenance unchanged.
