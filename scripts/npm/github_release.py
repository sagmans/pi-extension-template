"""Create-only GitHub controls; conflicting existing policy needs human review."""

import json
import os
from collections.abc import Mapping
from dataclasses import dataclass
from typing import TYPE_CHECKING

from execution import (
    JSON,
    mutate,
    read_json,
    require,
    require_list,
    require_object,
    require_objects,
    require_positive_int,
    run,
    setting,
)

if TYPE_CHECKING:
    # Type-only import: release.py imports this module at runtime.
    from release import Target

ACTION = "setup-github-release"
HOST = "github.com"
ADMIN_ROLE_ID = 5
SAFE_NAME = r"[A-Za-z0-9][A-Za-z0-9._-]*"
REVIEWER_PATTERN = r"[A-Za-z0-9][A-Za-z0-9-]{0,38}"
TAG_PATTERN = r"[A-Za-z0-9._/-]+\*?"


@dataclass(frozen=True)
class _ReleaseControls:
    """Expected GitHub endpoints and payloads for one repository release setup."""

    environment_endpoint: str
    policies_endpoint: str
    rulesets_endpoint: str
    reviewer_id: int
    tag: str
    ruleset_name: str
    branch_policy: dict[str, bool]
    environment_payload: dict[str, object]
    ruleset_payload: dict[str, object]


class _GitHubApi:
    """Scoped wrapper around `gh api` for read-only inspection and gated writes."""

    def __init__(self, gh_bin: str) -> None:
        self._gh_bin = gh_bin

    def command(self, endpoint: str, *args: str) -> list[str]:
        """Build a `gh api` argument vector pinned to the configured GitHub host."""
        return [self._gh_bin, "api", "--hostname", HOST, endpoint, *args]

    def get(self, endpoint: str, *, missing: bool = False) -> JSON:
        """Fetch a single JSON endpoint, returning None on HTTP 404 only when allowed."""
        result = run(self.command(endpoint), check=False)
        if missing and result.returncode != 0 and "(HTTP 404)" in result.stderr:
            return None
        require(result.returncode == 0, "GitHub inspection failed; no absence inferred")
        return read_json(result.stdout)

    def pages(self, endpoint: str, key: str | None = None) -> list[dict[str, JSON]]:
        """Fetch all paginated objects from a GitHub list endpoint."""
        value = require_list(
            read_json(run(self.command(endpoint, "--paginate", "--slurp")).stdout),
            "unexpected GitHub pagination response",
        )
        items: list[dict[str, JSON]] = []
        for page in value:
            entries = page.get(key) if key and isinstance(page, dict) else page
            items.extend(require_objects(entries, "unexpected GitHub list response"))
        return items

    def change(self, endpoint: str, method: str, payload: Mapping[str, object]) -> None:
        """Submit a JSON mutation through the shared dry-run/confirmation gate."""
        mutate(
            ACTION,
            self.command(endpoint, "--method", method, "--input", "-"),
            data=json.dumps(payload, sort_keys=True),
        )


def _has_admin_access(repo: JSON, expected_repo: str) -> bool:
    """Return whether a GitHub repository response confirms admin access on expected_repo."""
    if not isinstance(repo, dict) or repo.get("full_name") != expected_repo:
        return False
    permissions = repo.get("permissions")
    return isinstance(permissions, dict) and permissions.get("admin") is True


def _matches_reviewer(entry: JSON, reviewer_id: int) -> bool:
    """Return whether a protection rule entry names only the expected GitHub user."""
    if not isinstance(entry, dict) or entry.get("type") != "User":
        return False
    reviewer = entry.get("reviewer")
    return isinstance(reviewer, dict) and reviewer.get("id") == reviewer_id


def _verify_reviewer(api: _GitHubApi, reviewer: str) -> int:
    """Verify the configured GitHub reviewer login and return their positive user ID."""
    user = require_object(api.get(f"users/{reviewer}"), "reviewer identity not verified")
    login = user.get("login")
    require(
        isinstance(login, str) and login.lower() == reviewer.lower(),
        "reviewer identity not verified",
    )
    return require_positive_int(user.get("id"), "reviewer identity not verified")


def _build_controls(
    repo: str, environment: str, reviewer_id: int, tag: str, ruleset_name: str
) -> _ReleaseControls:
    """Construct the expected GitHub endpoints and create-only payloads for one release."""
    environment_endpoint = f"repos/{repo}/environments/{environment}"
    branch_policy = {"protected_branches": False, "custom_branch_policies": True}
    return _ReleaseControls(
        environment_endpoint=environment_endpoint,
        policies_endpoint=f"{environment_endpoint}/deployment-branch-policies",
        rulesets_endpoint=f"repos/{repo}/rulesets",
        reviewer_id=reviewer_id,
        tag=tag,
        ruleset_name=ruleset_name,
        branch_policy=branch_policy,
        environment_payload={
            "can_admins_bypass": False,
            "reviewers": [{"type": "User", "id": reviewer_id}],
            "deployment_branch_policy": branch_policy,
        },
        ruleset_payload={
            "name": ruleset_name,
            "target": "tag",
            "enforcement": "active",
            "conditions": {"ref_name": {"include": [f"refs/tags/{tag}"], "exclude": []}},
            "rules": [{"type": "creation"}, {"type": "update"}, {"type": "deletion"}],
            "bypass_actors": [
                {
                    "actor_id": ADMIN_ROLE_ID,
                    "actor_type": "RepositoryRole",
                    "bypass_mode": "always",
                }
            ],
        },
    )


def _inspect_environment(
    api: _GitHubApi, controls: _ReleaseControls
) -> tuple[dict[str, JSON] | None, list[dict[str, JSON]]]:
    """Validate an existing release environment and its tag deployment policies."""
    raw_current = api.get(controls.environment_endpoint, missing=True)
    if raw_current is None:
        return None, []
    current = require_object(raw_current, "existing environment conflicts; refusing overwrite")
    require(
        current.get("can_admins_bypass") is False
        and current.get("deployment_branch_policy") == controls.branch_policy,
        "existing environment conflicts; refusing overwrite",
    )
    protections = require_objects(
        current.get("protection_rules", []), "unexpected environment protections"
    )
    reviews = [rule for rule in protections if rule.get("type") == "required_reviewers"]
    require(len(reviews) == 1, "existing reviewer controls conflict")
    reviewers = reviews[0].get("reviewers", [])
    require(
        isinstance(reviewers, list)
        and len(reviewers) == 1
        and _matches_reviewer(reviewers[0], controls.reviewer_id),
        "existing reviewer controls conflict",
    )
    policies = api.pages(controls.policies_endpoint, "branch_policies")
    require(
        len(policies) <= 1
        and all(
            policy.get("name") == controls.tag and policy.get("type") == "tag"
            for policy in policies
        ),
        "existing deployment policies conflict; branch and tag policies are distinct",
    )
    return current, policies


def _inspect_rulesets(api: _GitHubApi, controls: _ReleaseControls) -> list[dict[str, JSON]]:
    """Validate that at most one repository ruleset matches the configured name and policy."""
    matches = [
        item
        for item in api.pages(controls.rulesets_endpoint)
        if item.get("name") == controls.ruleset_name
    ]
    require(len(matches) <= 1, "multiple named rulesets conflict")
    if matches:
        entry = matches[0]
        require(
            entry.get("source_type") == "Repository" and type(entry.get("id")) is int,
            "inherited or malformed ruleset conflicts",
        )
        details = api.get(f"{controls.rulesets_endpoint}/{entry['id']}")
        require(
            isinstance(details, dict)
            and all(details.get(key) == value for key, value in controls.ruleset_payload.items()),
            "existing ruleset conflicts; refusing overwrite",
        )
    return matches


def _inspect_controls(
    api: _GitHubApi, controls: _ReleaseControls
) -> tuple[dict[str, JSON] | None, list[dict[str, JSON]], list[dict[str, JSON]]]:
    """Read back the current GitHub environment, deployment policies, and rulesets."""
    current, policies = _inspect_environment(api, controls)
    matches = _inspect_rulesets(api, controls)
    return current, policies, matches


def setup_github(target: "Target") -> None:
    """Create missing GitHub release controls and refuse to replace any that differ."""
    _, environment = target.workflow()
    reviewer = setting("REVIEWER", REVIEWER_PATTERN)
    tag = setting("TAG_PATTERN", TAG_PATTERN)
    require(".." not in tag and "//" not in tag and not tag.startswith("/"), "invalid TAG_PATTERN")
    ruleset_name = setting("RULESET_NAME", SAFE_NAME)
    run([target.gh_bin, "auth", "status", "--hostname", HOST])

    api = _GitHubApi(target.gh_bin)
    require(
        _has_admin_access(api.get(f"repos/{target.repo}"), target.repo),
        "expected repository administration access not verified",
    )
    reviewer_id = _verify_reviewer(api, reviewer)
    controls = _build_controls(target.repo, environment, reviewer_id, tag, ruleset_name)

    current, policies, matches = _inspect_controls(api, controls)
    if current is None:
        api.change(controls.environment_endpoint, "PUT", controls.environment_payload)
    if not policies:
        api.change(controls.policies_endpoint, "POST", {"name": tag, "type": "tag"})
    if not matches:
        api.change(controls.rulesets_endpoint, "POST", controls.ruleset_payload)
    if os.environ.get("DRY_RUN", "0") == "1":
        print("GitHub preview only; no controls changed.")
    else:
        current, policies, matches = _inspect_controls(api, controls)
        require(
            current is not None and len(policies) == 1 and len(matches) == 1,
            "GitHub readback incomplete; inspect partial state before retrying",
        )
        print("GitHub environment, tag policy, and named ruleset readback verified.")
