#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"
RESTORE_SCRIPT="$ROOT/portfolio/scripts/restore_project2424_to_inkling.sh"
TMP_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/project2424-restore-test.XXXXXX")"
PACKAGE=""

cleanup() {
  [[ -z "$PACKAGE" ]] || rm -rf "$PACKAGE"
  rm -rf "$TMP_ROOT"
}
trap cleanup EXIT

SOURCE="$TMP_ROOT/source"
mkdir -p "$SOURCE"
git -C "$SOURCE" init --quiet
git -C "$SOURCE" config user.email "ci@example.invalid"
git -C "$SOURCE" config user.name "Project 2424 Recovery CI"

printf 'base\n' > "$SOURCE/committed.txt"
printf 'staged-base\n' > "$SOURCE/staged.txt"
printf 'unstaged-base\n' > "$SOURCE/unstaged.txt"
git -C "$SOURCE" add .
git -C "$SOURCE" commit --quiet -m "test fixture"

printf 'staged-change\n' >> "$SOURCE/staged.txt"
git -C "$SOURCE" add staged.txt
printf 'unstaged-change\n' >> "$SOURCE/unstaged.txt"
mkdir -p "$SOURCE/nested dir"
printf '#!/usr/bin/env bash\nprintf "untracked executable\\n"\n' > "$SOURCE/nested dir/new tool.sh"
chmod +x "$SOURCE/nested dir/new tool.sh"
printf 'untracked\n' > "$SOURCE/nested.txt"

SOURCE_HEAD_BEFORE="$(git -C "$SOURCE" rev-parse HEAD)"
SOURCE_BRANCH_BEFORE="$(git -C "$SOURCE" branch --show-current)"
git -C "$SOURCE" status --porcelain=v1 --untracked-files=all > "$TMP_ROOT/source-status-before.txt"
git -C "$SOURCE" diff --binary > "$TMP_ROOT/source-unstaged-before.patch"
git -C "$SOURCE" diff --cached --binary > "$TMP_ROOT/source-staged-before.patch"
shasum -a 256 "$SOURCE/nested dir/new tool.sh" "$SOURCE/nested.txt" > "$TMP_ROOT/source-untracked-before.sha256"

OUTPUT="$TMP_ROOT/package-output.txt"
bash "$RESTORE_SCRIPT" --source "$SOURCE" --package-only | tee "$OUTPUT"
PACKAGE="$(sed -n 's/^package=//p' "$OUTPUT" | tail -n 1)"
[[ -n "$PACKAGE" && -d "$PACKAGE/payload" ]]

# Packaging must be strictly read-only with respect to the canonical source.
[[ "$(git -C "$SOURCE" rev-parse HEAD)" == "$SOURCE_HEAD_BEFORE" ]]
[[ "$(git -C "$SOURCE" branch --show-current)" == "$SOURCE_BRANCH_BEFORE" ]]
git -C "$SOURCE" status --porcelain=v1 --untracked-files=all > "$TMP_ROOT/source-status-after.txt"
git -C "$SOURCE" diff --binary > "$TMP_ROOT/source-unstaged-after.patch"
git -C "$SOURCE" diff --cached --binary > "$TMP_ROOT/source-staged-after.patch"
shasum -a 256 "$SOURCE/nested dir/new tool.sh" "$SOURCE/nested.txt" > "$TMP_ROOT/source-untracked-after.sha256"
cmp "$TMP_ROOT/source-status-before.txt" "$TMP_ROOT/source-status-after.txt"
cmp "$TMP_ROOT/source-unstaged-before.patch" "$TMP_ROOT/source-unstaged-after.patch"
cmp "$TMP_ROOT/source-staged-before.patch" "$TMP_ROOT/source-staged-after.patch"
cmp "$TMP_ROOT/source-untracked-before.sha256" "$TMP_ROOT/source-untracked-after.sha256"

(
  cd "$PACKAGE/payload"
  sha256sum -c SHA256SUMS
)

# Hash verification must stop a modified transfer before it can create a canonical checkout.
TAMPERED="$TMP_ROOT/tampered-payload"
cp -R "$PACKAGE/payload" "$TAMPERED"
printf 'tamper\n' >> "$TAMPERED/staged.patch"
TAMPER_HOME="$TMP_ROOT/tamper-home"
if HOME="$TAMPER_HOME" bash "$TAMPERED/remote_restore.sh" "$TAMPERED" tamper-test > "$TMP_ROOT/tamper-output.txt" 2>&1; then
  echo "Tampered Project 2424 package unexpectedly restored" >&2
  exit 1
fi
[[ ! -e "$TAMPER_HOME/projects/project-2424" ]]
grep -Eq 'FAILED|did NOT match|checksum' "$TMP_ROOT/tamper-output.txt"

# A pre-existing cloud directory must be backed up before promotion.
TEST_HOME="$TMP_ROOT/home"
PRIOR="$TEST_HOME/projects/project-2424"
mkdir -p "$PRIOR"
printf 'prior cloud checkout\n' > "$PRIOR/prior-marker.txt"
HOME="$TEST_HOME" bash "$PACKAGE/payload/remote_restore.sh" "$PACKAGE/payload" ci-test
RESTORED="$TEST_HOME/projects/project-2424"
EVIDENCE="$RESTORED/artifacts/recovery/ci-test"

[[ "$(git -C "$RESTORED" rev-parse HEAD)" == "$SOURCE_HEAD_BEFORE" ]]
[[ "$(git -C "$RESTORED" branch --show-current)" == "recovery/inkling-ci-test" ]]
grep -q '^staged-change$' "$RESTORED/staged.txt"
grep -q '^unstaged-change$' "$RESTORED/unstaged.txt"
grep -q '^untracked$' "$RESTORED/nested.txt"
grep -q '^printf "untracked executable\\n"$' "$RESTORED/nested dir/new tool.sh"
[[ -x "$RESTORED/nested dir/new tool.sh" ]]
! git -C "$RESTORED" diff --cached --quiet -- staged.txt
! git -C "$RESTORED" diff --quiet -- unstaged.txt
[[ -f "$EVIDENCE/final-fsck.txt" ]]
[[ -f "$EVIDENCE/transfer-sha256s.txt" ]]
[[ -f "$EVIDENCE/prior-cloud-directory.txt" ]]
BACKUP="$(cat "$EVIDENCE/prior-cloud-directory.txt")"
[[ -d "$BACKUP" ]]
grep -q '^prior cloud checkout$' "$BACKUP/prior-marker.txt"

# Remote restore must not mutate the original source either.
[[ "$(git -C "$SOURCE" rev-parse HEAD)" == "$SOURCE_HEAD_BEFORE" ]]
git -C "$SOURCE" status --porcelain=v1 --untracked-files=all > "$TMP_ROOT/source-status-final.txt"
cmp "$TMP_ROOT/source-status-before.txt" "$TMP_ROOT/source-status-final.txt"

printf 'PROJECT_2424_RECOVERY_TEST_PASSED\n'
