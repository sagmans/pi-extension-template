# Publish an authorized release

Follow [Start](../start.md). Require the applicable authorization for the specific package, version, registry, and publication mechanism. Read [Release preparation](prepare.md) and confirm its evidence still refers to the selected revision and artifact.

Inspect current registry state and release workflow identity before mutation. Use primary provider resources from [Engineering resources](../../resources/engineering.md). Do not infer package absence from an authentication or network error. Recheck that a concurrent release has not already published the version.

For first publication, follow the separately approved bootstrap authority and then return to the intended recurring process. The [optional npm helpers](../../docs/npm-release-setup.md) support a reviewed tarball and independent trust configuration. Their existence supplies no publication authority. For recurring publication, use the target's approved workflow or manual procedure. Direct publication and staged publication are different outcomes; confirm which is authorized. Never substitute a broader token or a different registry when the intended path fails.

Publish the verified artifact through the approved mechanism. If the mechanism rebuilds it, identify that as a new artifact and ensure the target's release evidence covers the bytes actually delivered. Preserve source-to-artifact identity and any applicable approval, signing, and provenance requirements. Do not invent a universal tag or CI job layout.

Observe the operation's terminal result. An accepted dispatch is not completed publication. Verify registry version, package identity, artifact integrity, intended tag or channel, and provenance where applicable. Where authorized, install the delivered artifact into disposable state and exercise the relevant user path.

On timeout or ambiguous failure, inspect external state before retrying. A failed response can follow a successful mutation. Do not overwrite an existing version or rewrite a published history to conceal failure; use [Recover](recover.md) and current registry policy.

Report the exact delivered or staged identity, verification evidence, remaining steps, and any partial outcome. Never call a staged release publicly available until the required approval and publication have actually completed.
