from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path

from validate_v3_authorization import (
    AUTH,
    PREREG,
    materialize_execution_manifest,
    read_json,
)


HERE = Path(__file__).resolve().parent
DEFAULT_EXECUTION_MANIFEST = HERE / "manifest_v3_execution.json"
DEFAULT_OUT = HERE / "artifacts_v3"


def write_json(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def write_and_verify_checksums(out: Path, required: list[str]) -> None:
    checksum_name = "SHA256SUMS.txt"
    targets = [name for name in required if name != checksum_name]
    missing = [name for name in targets if not (out / name).is_file()]
    if missing:
        raise RuntimeError(f"Required execution artifacts missing before checksum finalization: {missing}")

    lines = [f"{sha256_file(out / name)}  {name}" for name in sorted(targets)]
    checksum_path = out / checksum_name
    checksum_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    observed = {}
    for line in checksum_path.read_text(encoding="utf-8").splitlines():
        digest, name = line.split("  ", 1)
        observed[name] = digest
    for name in targets:
        actual = sha256_file(out / name)
        if observed.get(name) != actual:
            raise RuntimeError(f"Checksum verification failed for {name}")

    final_missing = [name for name in required if not (out / name).is_file()]
    if final_missing:
        raise RuntimeError(f"Execution did not satisfy frozen artifact contract: {final_missing}")


def materialize(manifest_path: Path) -> dict:
    prereg = read_json(PREREG)
    authorization = read_json(AUTH)
    execution = materialize_execution_manifest(prereg, authorization)
    changed = {key for key in prereg if prereg.get(key) != execution.get(key)}
    if changed != {"status", "execution_authorized"}:
        raise RuntimeError(f"Refusing execution manifest with scientific drift: {sorted(changed)}")
    write_json(manifest_path, execution)
    return execution


def main() -> int:
    parser = argparse.ArgumentParser(description="Materialize and, once authorized, execute T2424-0027 v3.")
    parser.add_argument("--dry-run", action="store_true", help="Validate/materialize only; never instantiate the encoder.")
    parser.add_argument("--manifest", type=Path, default=DEFAULT_EXECUTION_MANIFEST)
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT)
    args = parser.parse_args()

    subprocess.run([sys.executable, str(HERE / "validate_v3_authorization.py")], check=True)
    execution = materialize(args.manifest)

    required = list(execution["artifacts"]["required"])
    expected_required = {
        "resolved_manifest.json",
        "environment.json",
        "dataset_fingerprint.json",
        "model_revision.json",
        "per_seed_metrics.jsonl",
        "summary.json",
        "verdict.json",
        "SHA256SUMS.txt",
    }
    if set(required) != expected_required:
        raise RuntimeError(f"Frozen required-artifact contract drifted: {required}")

    if args.dry_run:
        print("PASS: dry-run materialized an execution manifest with only status/authorization state changed")
        return 0

    if args.out.exists():
        raise RuntimeError(f"Refusing to execute into existing output directory: {args.out}")

    subprocess.run(
        [
            sys.executable,
            str(HERE / "run.py"),
            "--manifest",
            str(args.manifest),
            "--out",
            str(args.out),
        ],
        check=True,
    )
    write_and_verify_checksums(args.out, required)
    print(f"PASS: execution completed and frozen artifact contract verified at {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
