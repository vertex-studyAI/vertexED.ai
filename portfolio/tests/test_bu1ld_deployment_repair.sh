#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SCRIPT="$ROOT/portfolio/scripts/bu1ld-deployment-repair.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

TARGET="$TMP/target"
BIN="$TMP/bin"
MARKERS="$TMP/markers"
mkdir -p "$TARGET" "$BIN" "$MARKERS"

git -C "$TARGET" init -q
git -C "$TARGET" config user.name "Bu1LD Fixture"
git -C "$TARGET" config user.email "fixture@example.invalid"
printf 'fixture\n' > "$TARGET/README.md"
git -C "$TARGET" add README.md
git -C "$TARGET" commit -q -m "fixture"
TARGET_SHA="$(git -C "$TARGET" rev-parse HEAD)"

cat > "$BIN/bun" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
printf 'bun %s\n' "$*" >> "$BU1LD_TEST_MARKERS/commands.log"
if [[ "${1:-}" == "--version" ]]; then
  printf '1.3.14\n'
fi
EOF

cat > "$BIN/npx" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
printf 'npx %s\n' "$*" >> "$BU1LD_TEST_MARKERS/commands.log"
if [[ "${1:-}" == "wrangler" && "${2:-}" == "--version" ]]; then
  printf '4.54.0\n'
  exit 0
fi
if [[ "$*" == *"deploy"* || "$*" == *"rollback"* ]]; then
  touch "$BU1LD_TEST_MARKERS/production-write-attempted"
fi
EOF

cat > "$BIN/node" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
printf 'node %s\n' "$*" >> "$BU1LD_TEST_MARKERS/commands.log"
if [[ "${1:-}" == *"bu1ld-production-smoke.mjs" ]]; then
  printf '8/8 read-only routes passed\n'
  exit 0
fi
printf 'unexpected node invocation in fixture: %s\n' "$*" >&2
exit 1
EOF

cat > "$BIN/curl" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
touch "$BU1LD_TEST_MARKERS/production-write-attempted"
printf 'curl must not run during fixture\n' >&2
exit 1
EOF

chmod +x "$BIN/bun" "$BIN/npx" "$BIN/node" "$BIN/curl"

run_repair() {
  local evidence="$1"
  shift
  env \
    PATH="$BIN:$PATH" \
    BU1LD_TEST_MARKERS="$MARKERS" \
    BU1LD_REPO_PATH="$TARGET" \
    BU1LD_EVIDENCE_DIR="$evidence" \
    "$@" \
    bash "$SCRIPT"
}

DRY_EVIDENCE="$TMP/evidence-dry"
run_repair "$DRY_EVIDENCE" \
  BU1LD_EXPECTED_SHA="$TARGET_SHA" \
  BU1LD_EXECUTE_DEPLOY=0 \
  > "$TMP/dry-run.log"

grep -q 'DRY RUN COMPLETE' "$TMP/dry-run.log"
test -s "$DRY_EVIDENCE/execution.log"
test -s "$DRY_EVIDENCE/source-commit.txt"
test -s "$DRY_EVIDENCE/predeploy-http-smoke.log"
grep -q 'bun install --frozen-lockfile' "$MARKERS/commands.log"
grep -q 'bun run release:check' "$MARKERS/commands.log"
grep -q 'npx wrangler --version' "$MARKERS/commands.log"
test ! -e "$MARKERS/production-write-attempted"

if run_repair "$TMP/evidence-wrong-sha" \
  BU1LD_EXPECTED_SHA="0000000000000000000000000000000000000000" \
  BU1LD_EXECUTE_DEPLOY=0 \
  > "$TMP/wrong-sha.log" 2>&1; then
  echo 'wrong SHA unexpectedly passed' >&2
  exit 1
fi
grep -q 'expected 0000000000000000000000000000000000000000' "$TMP/wrong-sha.log"

touch "$TARGET/uncommitted.txt"
if run_repair "$TMP/evidence-dirty" \
  BU1LD_EXPECTED_SHA="$TARGET_SHA" \
  BU1LD_EXECUTE_DEPLOY=0 \
  > "$TMP/dirty.log" 2>&1; then
  echo 'dirty checkout unexpectedly passed' >&2
  exit 1
fi
grep -q 'uncommitted changes' "$TMP/dirty.log"
rm "$TARGET/uncommitted.txt"

if run_repair "$TMP/evidence-no-token" \
  BU1LD_EXPECTED_SHA="$TARGET_SHA" \
  BU1LD_EXECUTE_DEPLOY=1 \
  > "$TMP/no-token.log" 2>&1; then
  echo 'deployment without Cloudflare token unexpectedly passed' >&2
  exit 1
fi
grep -q 'CLOUDFLARE_API_TOKEN is required' "$TMP/no-token.log"
test ! -e "$MARKERS/production-write-attempted"

printf 'Bu1LD deployment repair fixture passed\n'
