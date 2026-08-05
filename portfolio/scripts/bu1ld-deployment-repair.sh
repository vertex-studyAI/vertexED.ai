#!/usr/bin/env bash
set -euo pipefail

CONTROL_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TARGET_ROOT="${BU1LD_REPO_PATH:-}"
EXPECTED_SHA="${BU1LD_EXPECTED_SHA:-daa80c1124b2a6d7d09b7669e04d29e50cffcbbe}"
BASE_URL="${BU1LD_BASE_URL:-https://thebu1ld.com}"
EXECUTE_DEPLOY="${BU1LD_EXECUTE_DEPLOY:-0}"
PURGE_CACHE="${BU1LD_PURGE_CACHE:-0}"
EVIDENCE_DIR="${BU1LD_EVIDENCE_DIR:-$CONTROL_ROOT/.percy/evidence/bu1ld-deploy-$(date -u +%Y%m%dT%H%M%SZ)}"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "required command not found: $1"
}

[[ -n "$TARGET_ROOT" ]] || fail "set BU1LD_REPO_PATH to an authenticated checkout of ryangomez010/bu1ld-landing"
[[ -d "$TARGET_ROOT/.git" ]] || fail "BU1LD_REPO_PATH is not a Git checkout: $TARGET_ROOT"

for command in git bun node npx curl; do
  require_command "$command"
done

mkdir -p "$EVIDENCE_DIR"
exec > >(tee "$EVIDENCE_DIR/execution.log") 2>&1

printf 'Bu1LD deployment repair preflight\n'
printf 'target=%s\nexpected_sha=%s\nbase_url=%s\nexecute_deploy=%s\npurge_cache=%s\nevidence=%s\n' \
  "$TARGET_ROOT" "$EXPECTED_SHA" "$BASE_URL" "$EXECUTE_DEPLOY" "$PURGE_CACHE" "$EVIDENCE_DIR"

actual_sha="$(git -C "$TARGET_ROOT" rev-parse HEAD)"
[[ "$actual_sha" == "$EXPECTED_SHA" ]] || fail "target checkout is $actual_sha, expected $EXPECTED_SHA"

[[ -z "$(git -C "$TARGET_ROOT" status --porcelain)" ]] || fail "target checkout has uncommitted changes"

git -C "$TARGET_ROOT" status --short --branch | tee "$EVIDENCE_DIR/git-status.txt"
git -C "$TARGET_ROOT" log -1 --format=fuller | tee "$EVIDENCE_DIR/source-commit.txt"
bun --version | tee "$EVIDENCE_DIR/bun-version.txt"
(
  cd "$TARGET_ROOT"
  npx wrangler --version | tee "$EVIDENCE_DIR/wrangler-version.txt"
  bun install --frozen-lockfile
  bun run release:check
)

node "$CONTROL_ROOT/portfolio/scripts/bu1ld-production-smoke.mjs" \
  | tee "$EVIDENCE_DIR/predeploy-http-smoke.log"

if [[ "$EXECUTE_DEPLOY" != "1" ]]; then
  cat <<EOF

DRY RUN COMPLETE.
No Cloudflare deployment or cache purge occurred.

To execute after reviewing this evidence, export the strict production variables required by
'bun run release:prod', set CLOUDFLARE_API_TOKEN, then rerun with:

  BU1LD_REPO_PATH='$TARGET_ROOT' \\
  BU1LD_EXPECTED_SHA='$EXPECTED_SHA' \\
  BU1LD_EXECUTE_DEPLOY=1 \\
  '$CONTROL_ROOT/portfolio/scripts/bu1ld-deployment-repair.sh'
EOF
  exit 0
fi

[[ -n "${CLOUDFLARE_API_TOKEN:-}" ]] || fail "CLOUDFLARE_API_TOKEN is required for deployment"

(
  cd "$TARGET_ROOT"
  printf '\nActive deployments before change:\n'
  npx wrangler deployments list | tee "$EVIDENCE_DIR/deployments-before.txt"

  # This strict gate must fail closed if live Supabase, email, or deployment configuration is absent.
  bun run release:prod | tee "$EVIDENCE_DIR/strict-production-gate.log"

  bun run deploy:cf | tee "$EVIDENCE_DIR/deploy.log"

  printf '\nActive deployments after change:\n'
  npx wrangler deployments list | tee "$EVIDENCE_DIR/deployments-after.txt"
)

if [[ "$PURGE_CACHE" == "1" ]]; then
  [[ -n "${CLOUDFLARE_ZONE_ID:-}" ]] || fail "CLOUDFLARE_ZONE_ID is required when BU1LD_PURGE_CACHE=1"

  purge_payload="$(node -e '
    const base = process.argv[1].replace(/\/$/, "");
    const paths = ["/", "/signup", "/login", "/projects", "/programs-public", "/evidence", "/privacy", "/terms"];
    process.stdout.write(JSON.stringify({ files: paths.map((path) => `${base}${path}`) }));
  ' "$BASE_URL")"

  curl --fail-with-body --silent --show-error \
    --request POST \
    --url "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache" \
    --header "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    --header 'Content-Type: application/json' \
    --data "$purge_payload" \
    | tee "$EVIDENCE_DIR/cache-purge.json"
fi

node "$CONTROL_ROOT/portfolio/scripts/bu1ld-production-smoke.mjs" \
  | tee "$EVIDENCE_DIR/postdeploy-http-smoke.log"

cat <<EOF

DEPLOYMENT COMMANDS COMPLETED.

Next mandatory step: run the draft browser contract from the control repository and require it to pass
without relaxing hydration assertions:

  cd '$CONTROL_ROOT'
  npm ci
  npx playwright install --with-deps chromium
  BU1LD_BASE_URL='$BASE_URL' \\
    npx playwright test --config=portfolio/bu1ld/playwright.config.ts

If hydration, copy, route, or role checks regress, choose the stable version ID from:
  $EVIDENCE_DIR/deployments-before.txt
and roll back from the target checkout with:
  npx wrangler rollback <VERSION_ID> --message 'Rollback after failed Bu1LD production certification'

Evidence directory:
  $EVIDENCE_DIR
EOF
