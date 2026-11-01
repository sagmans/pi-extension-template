"""Shared approval and CLI boundaries for optional release operations."""

import json
import os
import re
import shlex
import subprocess
from collections.abc import Sequence
from pathlib import Path
from typing import TypeAlias

# Values that json.loads can return; callers validate the shape they need.
JSON: TypeAlias = dict[str, "JSON"] | list["JSON"] | str | int | float | bool | None


class ReleaseError(Exception):
    """An unmet release condition, without raw provider response data."""


def require(condition: object, message: str) -> None:
    """Stop the release with a safe message whenever a guard does not hold."""
    if not condition:
        raise ReleaseError(message)


def setting(name: str, pattern: str | None = None) -> str:
    """Read operator input from the environment and reject absent or malformed values."""
    value = os.environ.get(name, "")
    require(
        bool(value) and (pattern is None or re.fullmatch(pattern, value)),
        f"invalid or missing {name}",
    )
    return value


def read_json(text: str) -> JSON:
    """Parse tool output without leaking the raw response into the error."""
    try:
        return json.loads(text)
    except (ValueError, TypeError) as error:
        message = "invalid JSON response or metadata"
        raise ReleaseError(message) from error


def run(
    command: Sequence[str], *, data: str | None = None, check: bool = True
) -> subprocess.CompletedProcess[str]:
    """Run a read-only CLI call and capture output so callers can inspect the result."""
    result = subprocess.run(  # noqa: S603 argv list, no shell; operator-chosen binary
        command, input=data, text=True, capture_output=True, check=False
    )
    require(
        not check or result.returncode == 0,
        f"{Path(command[0]).name} read failed; inspect authentication and service status privately",
    )
    return result


def mutate(action: str, command: Sequence[str], *, data: str | None = None) -> None:
    """Run a remote write only after explicit confirmation, or only preview it in dry-run."""
    dry_run = os.environ.get("DRY_RUN", "0") == "1"
    require(dry_run or os.environ.get("CONFIRM") == action, f"set CONFIRM={action}")
    print(("dry-run: " if dry_run else "running: ") + shlex.join(command), flush=True)
    if data is not None:
        print(data, flush=True)
    if dry_run:
        return
    # Inherited streams keep npm's interactive 2FA usable; callers must not record secrets.
    result = subprocess.run(  # noqa: S603 argv list, no shell; operator-chosen binary
        command, input=data, text=True, check=False
    )
    require(
        result.returncode == 0,
        "mutation failed or outcome unknown; inspect remote state before any retry",
    )
