# Bu1LD Build Identity Recovery

## Purpose

Issue #84 proves that the live Bu1LD deployment can serve healthy HTTP documents while the React client reports hydration error #418 and public programme copy differs from the selected source commit. The immediate diagnostic gap is deployment identity: production does not expose which immutable commit generated the SSR HTML and client assets.

This recovery patch adds a public, non-secret build identity contract to immutable source commit `daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`.

## Contract

At build time, the application accepts the first available value from:

1. `BU1LD_BUILD_COMMIT`;
2. `CF_PAGES_COMMIT_SHA`;
3. `GITHUB_SHA`;
4. `unknown`.

Only 7–40 character hexadecimal Git identifiers are accepted. The normalized value is embedded in:

- `dist/client/build.json`;
- the SSR `<html data-bu1ld-build="…">` attribute;
- `<meta name="bu1ld-build" content="…">`;
- `<script id="bu1ld-build-identity" type="application/json">`;
- the server bundle;
- the client bundle.

Because SSR and client output use the same compile-time constant, mismatched HTML and assets become directly observable. A cache or deployment skew can be diagnosed by comparing the root HTML marker with `/build.json` and the intended deployment commit.

## Certification

The validation workflow:

1. checks out the immutable Bu1LD source;
2. applies the reviewable patch with `git apply --check`;
3. installs the frozen Bun lockfile;
4. runs the repository's complete non-secret `release:check` with a synthetic commit and public CI configuration;
5. verifies the emitted JSON, server bundle, and client bundle use the same commit;
6. starts the production preview and verifies the HTML and `/build.json` identity;
7. retains command and response evidence for 14 days.

## Publication boundary

The patch is not applied to `ryangomez010/bu1ld-landing` because the GitHub integration still cannot create a target branch. It does not redeploy Cloudflare or claim the hydration defect is fixed.

After target access is restored:

```bash
git checkout -b fix/build-identity

git apply /path/to/build-identity.patch
BU1LD_BUILD_COMMIT="$(git rev-parse HEAD)" bun run release:check
BU1LD_BUILD_COMMIT="$(git rev-parse HEAD)" bun run deploy:cf
```

Then verify that the production root HTML and `https://thebu1ld.com/build.json` expose the deployed commit before rerunning PR #79. If both markers match and hydration error #418 remains, continue into deterministic SSR debugging. If they differ, repair the deployment or cache skew before changing application code.
