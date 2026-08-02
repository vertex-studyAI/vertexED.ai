#!/usr/bin/env bash
# Restore Project 2424 to Inkling without discarding committed or uncommitted work.
# Run this script on the Mac that can access the PRO-BLADE and gcloud.

set -Eeuo pipefail
IFS=$'\n\t'

SOURCE_REPO="${P2424_SOURCE_REPO:-/Volumes/PRO-BLADE/Atlas/Project-2024/Project_2424}"
EXPECTED_COMMIT="${P2424_EXPECTED_COMMIT:-5952dd236638b48514071918fd083079fa517f03}"
VM_NAME="${INKLING_VM_NAME:-inkling-agent}"
ZONE="${INKLING_ZONE:-us-central1-a}"
PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || true)}"
RUN_VERIFY=0
KEEP_LOCAL_PACKAGE=0

usage() {
  cat <<'USAGE'
Usage: restore_project2424_to_inkling.sh [options]

Options:
  --source PATH          Canonical local Project 2424 Git repository.
  --verify               Install requirements in an Inkling venv and run the
                         smallest repository quality gate after restoration.
  --keep-local-package   Preserve the temporary local transfer package.
  -h, --help             Show this help.

Environment overrides:
  P2424_SOURCE_REPO
  P2424_EXPECTED_COMMIT
  INKLING_VM_NAME
  INKLING_ZONE
  GCP_PROJECT_ID

The script never resets, cleans, or deletes the source repository. It creates a
Git bundle plus staged, unstaged, and untracked overlays; restores into an
isolated Inkling staging directory; verifies it; backs up the prior cloud
folder; and only then promotes the restored checkout.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source)
      [[ $# -ge 2 ]] || { echo "--source requires a path" >&2; exit 2; }
      SOURCE_REPO="$2"
      shift 2
      ;;
    --verify)
      RUN_VERIFY=1
      shift
      ;;
    --keep-local-package)
      KEEP_LOCAL_PACKAGE=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

say() { printf '\n[Project 2424 recovery] %s\n' "$*"; }
fail() { printf '\n[Project 2424 recovery] ERROR: %s\n' "$*" >&2; exit 1; }
require() { command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"; }

require git
require python3
require gcloud
require shasum

[[ -n "$PROJECT_ID" && "$PROJECT_ID" != "(unset)" ]] || fail "No Google Cloud project configured. Set GCP_PROJECT_ID or run gcloud config set project PROJECT_ID."
[[ -d "$SOURCE_REPO/.git" ]] || fail "Not a Git repository: $SOURCE_REPO"

SOURCE_REPO="$(cd "$SOURCE_REPO" && pwd -P)"
SOURCE_HEAD="$(git -C "$SOURCE_REPO" rev-parse HEAD)"
SOURCE_BRANCH="$(git -C "$SOURCE_REPO" branch --show-current || true)"
SOURCE_BRANCH="${SOURCE_BRANCH:-detached}"
TS="$(date -u +%Y%m%d-%H%M%S)"
PACKAGE_NAME="project2424-recovery-$TS"
LOCAL_PACKAGE="$(mktemp -d "${TMPDIR:-/tmp}/$PACKAGE_NAME.XXXXXX")"
LOCAL_LOG="$LOCAL_PACKAGE/local-recovery.log"

cleanup() {
  if [[ "$KEEP_LOCAL_PACKAGE" -eq 0 ]]; then
    rm -rf "$LOCAL_PACKAGE"
  else
    say "Local package preserved at $LOCAL_PACKAGE"
  fi
}
trap cleanup EXIT

exec > >(tee -a "$LOCAL_LOG") 2>&1

say "Source repository: $SOURCE_REPO"
say "Source branch: $SOURCE_BRANCH"
say "Source HEAD: $SOURCE_HEAD"
say "Inkling target: $PROJECT_ID / $ZONE / $VM_NAME"

mkdir -p "$LOCAL_PACKAGE/payload"
PAYLOAD="$LOCAL_PACKAGE/payload"

# Capture provenance before creating transfer artifacts.
git -C "$SOURCE_REPO" status --short --branch > "$PAYLOAD/source-status.txt"
git -C "$SOURCE_REPO" log --oneline -30 > "$PAYLOAD/source-log.txt"
git -C "$SOURCE_REPO" remote -v > "$PAYLOAD/source-remotes.txt" || true
git -C "$SOURCE_REPO" diff --binary > "$PAYLOAD/unstaged.patch"
git -C "$SOURCE_REPO" diff --cached --binary > "$PAYLOAD/staged.patch"
git -C "$SOURCE_REPO" ls-files --others --exclude-standard -z > "$PAYLOAD/untracked.list"

say "Creating a complete Git bundle from all refs"
git -C "$SOURCE_REPO" bundle create "$PAYLOAD/repository.bundle" --all
git bundle verify "$PAYLOAD/repository.bundle"

say "Archiving untracked work without changing the source"
python3 - "$SOURCE_REPO" "$PAYLOAD/untracked.list" "$PAYLOAD/untracked.tar.gz" <<'PY'
import os
import sys
import tarfile
from pathlib import Path

root = Path(sys.argv[1]).resolve()
listing = Path(sys.argv[2]).read_bytes().split(b"\0")
out = Path(sys.argv[3])

with tarfile.open(out, "w:gz", dereference=False) as archive:
    seen = set()
    for raw in listing:
        if not raw:
            continue
        rel = Path(os.fsdecode(raw))
        if rel.is_absolute() or ".." in rel.parts:
            raise SystemExit(f"Unsafe untracked path: {rel}")
        if rel in seen:
            continue
        seen.add(rel)
        source = root / rel
        if source.exists() or source.is_symlink():
            archive.add(source, arcname=str(rel), recursive=False)
PY

printf '%s\n' "$SOURCE_HEAD" > "$PAYLOAD/source-head.txt"
printf '%s\n' "$SOURCE_BRANCH" > "$PAYLOAD/source-branch.txt"
printf '%s\n' "$EXPECTED_COMMIT" > "$PAYLOAD/expected-foundry-commit.txt"
printf '%s\n' "$RUN_VERIFY" > "$PAYLOAD/run-verify.txt"

cat > "$PAYLOAD/remote_restore.sh" <<'REMOTE'
#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

PACKAGE_DIR="${1:?package directory required}"
TS="${2:?timestamp required}"
PROJECTS="$HOME/projects"
STAGING_ROOT="$PROJECTS/.staging"
BACKUP_ROOT="$PROJECTS/.backups"
CANONICAL="$PROJECTS/project-2424"
STAGING="$STAGING_ROOT/project-2424-$TS"
RECOVERY_BRANCH="recovery/inkling-$TS"

say() { printf '\n[Inkling Project 2424 restore] %s\n' "$*"; }
fail() { printf '\n[Inkling Project 2424 restore] ERROR: %s\n' "$*" >&2; exit 1; }

for command in git python3 sha256sum; do
  command -v "$command" >/dev/null 2>&1 || fail "Missing command: $command"
done

[[ -f "$PACKAGE_DIR/repository.bundle" ]] || fail "Missing repository bundle"
[[ -f "$PACKAGE_DIR/source-head.txt" ]] || fail "Missing source HEAD record"
SOURCE_HEAD="$(tr -d '\r\n' < "$PACKAGE_DIR/source-head.txt")"
EXPECTED_COMMIT="$(tr -d '\r\n' < "$PACKAGE_DIR/expected-foundry-commit.txt")"
RUN_VERIFY="$(tr -d '\r\n' < "$PACKAGE_DIR/run-verify.txt")"

mkdir -p "$PROJECTS" "$STAGING_ROOT" "$BACKUP_ROOT"
[[ ! -e "$STAGING" ]] || fail "Staging path already exists: $STAGING"

say "Verifying transfer hashes"
(
  cd "$PACKAGE_DIR"
  sha256sum -c SHA256SUMS
)

say "Verifying and cloning Git bundle"
git bundle verify "$PACKAGE_DIR/repository.bundle"
git clone "$PACKAGE_DIR/repository.bundle" "$STAGING"
git -C "$STAGING" fsck --full

git -C "$STAGING" cat-file -e "$SOURCE_HEAD^{commit}" || fail "Source HEAD is absent from bundle: $SOURCE_HEAD"
git -C "$STAGING" switch -c "$RECOVERY_BRANCH" "$SOURCE_HEAD"

say "Applying preserved staged and unstaged changes"
if [[ -s "$PACKAGE_DIR/staged.patch" ]]; then
  git -C "$STAGING" apply --index "$PACKAGE_DIR/staged.patch"
fi
if [[ -s "$PACKAGE_DIR/unstaged.patch" ]]; then
  git -C "$STAGING" apply "$PACKAGE_DIR/unstaged.patch"
fi

say "Restoring untracked files"
python3 - "$STAGING" "$PACKAGE_DIR/untracked.tar.gz" <<'PY'
import sys
import tarfile
from pathlib import Path

root = Path(sys.argv[1]).resolve()
archive_path = Path(sys.argv[2])
with tarfile.open(archive_path, "r:gz") as archive:
    for member in archive.getmembers():
        target = (root / member.name).resolve()
        if root != target and root not in target.parents:
            raise SystemExit(f"Unsafe archive member: {member.name}")
    archive.extractall(root, filter="data")
PY

EVIDENCE="$STAGING/artifacts/recovery/$TS"
mkdir -p "$EVIDENCE"
cp "$PACKAGE_DIR/source-status.txt" "$EVIDENCE/"
cp "$PACKAGE_DIR/source-log.txt" "$EVIDENCE/"
cp "$PACKAGE_DIR/source-remotes.txt" "$EVIDENCE/"
cp "$PACKAGE_DIR/SHA256SUMS" "$EVIDENCE/transfer-sha256s.txt"
{
  echo "timestamp=$TS"
  echo "source_head=$SOURCE_HEAD"
  echo "restored_head=$(git -C "$STAGING" rev-parse HEAD)"
  echo "recovery_branch=$RECOVERY_BRANCH"
  echo "expected_foundry_commit=$EXPECTED_COMMIT"
  if git -C "$STAGING" merge-base --is-ancestor "$EXPECTED_COMMIT" HEAD 2>/dev/null; then
    echo "expected_foundry_commit_is_ancestor=true"
  else
    echo "expected_foundry_commit_is_ancestor=false"
  fi
  echo "python=$(python3 --version 2>&1)"
  echo "git=$(git --version 2>&1)"
} > "$EVIDENCE/restore-environment.txt"
git -C "$STAGING" status --short --branch > "$EVIDENCE/restored-status.txt"
git -C "$STAGING" remote -v > "$EVIDENCE/restored-remotes.txt" || true

say "Promoting verified staging checkout"
if [[ -e "$CANONICAL" ]]; then
  BACKUP="$BACKUP_ROOT/project-2424-before-restore-$TS"
  [[ ! -e "$BACKUP" ]] || fail "Backup path already exists: $BACKUP"
  mv "$CANONICAL" "$BACKUP"
  printf '%s\n' "$BACKUP" > "$EVIDENCE/prior-cloud-directory.txt"
fi
mv "$STAGING" "$CANONICAL"
EVIDENCE="$CANONICAL/artifacts/recovery/$TS"

say "Canonical cloud checkout is now $CANONICAL"
git -C "$CANONICAL" status --short --branch | tee "$EVIDENCE/final-status.txt"
git -C "$CANONICAL" fsck --full | tee "$EVIDENCE/final-fsck.txt"

if [[ "$RUN_VERIFY" == "1" ]]; then
  say "Creating isolated Python environment"
  python3 -m venv "$CANONICAL/.venv"
  "$CANONICAL/.venv/bin/python" -m pip install --upgrade pip |& tee "$EVIDENCE/pip-upgrade.log"
  if [[ -f "$CANONICAL/requirements-ci.txt" ]]; then
    "$CANONICAL/.venv/bin/python" -m pip install -r "$CANONICAL/requirements-ci.txt" |& tee "$EVIDENCE/install.log"
  else
    fail "--verify requested but requirements-ci.txt is missing"
  fi

  say "Running the smallest repository-owned quality gate"
  set +e
  if [[ -f "$CANONICAL/scripts/run_quality_gate.py" ]]; then
    (
      cd "$CANONICAL"
      .venv/bin/python scripts/run_quality_gate.py
    ) |& tee "$EVIDENCE/quality-gate.log"
    GATE_STATUS=${PIPESTATUS[0]}
  else
    (
      cd "$CANONICAL"
      PYTHONPATH=shared .venv/bin/python -m pytest tests -q
    ) |& tee "$EVIDENCE/quality-gate.log"
    GATE_STATUS=${PIPESTATUS[0]}
  fi
  set -e
  printf '%s\n' "$GATE_STATUS" > "$EVIDENCE/quality-gate-exit-code.txt"
  [[ "$GATE_STATUS" -eq 0 ]] || fail "Repository quality gate failed; evidence preserved at $EVIDENCE"
fi

cat <<REPORT

PROJECT_2424_INKLING_RESTORE_PASSED
canonical=$CANONICAL
head=$(git -C "$CANONICAL" rev-parse HEAD)
branch=$(git -C "$CANONICAL" branch --show-current)
evidence=$EVIDENCE
verification_requested=$RUN_VERIFY
REPORT
REMOTE
chmod +x "$PAYLOAD/remote_restore.sh"

(
  cd "$PAYLOAD"
  shasum -a 256 \
    repository.bundle \
    staged.patch \
    unstaged.patch \
    untracked.list \
    untracked.tar.gz \
    source-head.txt \
    source-branch.txt \
    expected-foundry-commit.txt \
    run-verify.txt \
    source-status.txt \
    source-log.txt \
    source-remotes.txt \
    remote_restore.sh \
    | sed 's/  /  /' > SHA256SUMS
)

say "Local package summary"
du -sh "$PAYLOAD"
cat "$PAYLOAD/SHA256SUMS"

say "Confirming Inkling is reachable"
gcloud compute instances describe "$VM_NAME" \
  --project "$PROJECT_ID" \
  --zone "$ZONE" \
  --format='value(status)' | grep -q '^RUNNING$' || fail "Inkling VM is not RUNNING"

say "Uploading preservation package"
gcloud compute ssh "$VM_NAME" \
  --project "$PROJECT_ID" \
  --zone "$ZONE" \
  --command "mkdir -p \"\$HOME/incoming/$PACKAGE_NAME\""

gcloud compute scp --recurse "$PAYLOAD"/. \
  "$VM_NAME:~/incoming/$PACKAGE_NAME/" \
  --project "$PROJECT_ID" \
  --zone "$ZONE"

say "Executing verified staging restore on Inkling"
gcloud compute ssh "$VM_NAME" \
  --project "$PROJECT_ID" \
  --zone "$ZONE" \
  --command "bash \"\$HOME/incoming/$PACKAGE_NAME/remote_restore.sh\" \"\$HOME/incoming/$PACKAGE_NAME\" \"$TS\""

say "Restore completed successfully"
cat <<REPORT
Source repository: $SOURCE_REPO
Source HEAD:       $SOURCE_HEAD
Source branch:     $SOURCE_BRANCH
Inkling checkout:  /home/ryan/projects/project-2424
Recovery issue:    vertex-studyAI/vertexED.ai#20
Verification run:  $RUN_VERIFY
REPORT
