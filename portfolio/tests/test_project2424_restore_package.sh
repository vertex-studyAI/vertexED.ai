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
mkdir -p "$SOURCE/nested"
printf 'untracked\n' > "$SOURCE/nested/new.txt"

OUTPUT="$TMP_ROOT/package-output.txt"
bash "$RESTORE_SCRIPT" --source "$SOURCE" --package-only | tee "$OUTPUT"
PACKAGE="$(sed -n 's/^package=//p' "$OUTPUT" | tail -n 1)"
[[ -n "$PACKAGE" && -d "$PACKAGE/payload" ]]

(
  cd "$PACKAGE/payload"
  sha256sum -c SHA256SUMS
)

TEST_HOME="$TMP_ROOT/home"
HOME="$TEST_HOME" bash "$PACKAGE/payload/remote_restore.sh" "$PACKAGE/payload" ci-test
RESTORED="$TEST_HOME/projects/project-2424"

[[ "$(git -C "$RESTORED" rev-parse HEAD)" == "$(git -C "$SOURCE" rev-parse HEAD)" ]]
grep -q '^staged-change$' "$RESTORED/staged.txt"
grep -q '^unstaged-change$' "$RESTORED/unstaged.txt"
grep -q '^untracked$' "$RESTORED/nested/new.txt"
! git -C "$RESTORED" diff --cached --quiet -- staged.txt
! git -C "$RESTORED" diff --quiet -- unstaged.txt
[[ -f "$RESTORED/artifacts/recovery/ci-test/final-fsck.txt" ]]
[[ -f "$RESTORED/artifacts/recovery/ci-test/transfer-sha256s.txt" ]]

printf 'PROJECT_2424_RECOVERY_TEST_PASSED\n'
