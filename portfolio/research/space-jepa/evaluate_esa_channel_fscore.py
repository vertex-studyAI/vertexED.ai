from __future__ import annotations

import argparse
import hashlib
import importlib
import json
from pathlib import Path
import re
import sys
from typing import Any

import numpy as np
import pandas as pd

PINNED_ESA_ADB_COMMIT = "aeebcd9ecd3e7266d6d6a035a8081b3da83dfe33"
PINNED_UPSTREAM_BLOBS = {
    "mission1_experiments.py": "255578f0aaeb53880818ce4c266f22ca7d2cbc44",
    "timeeval/metrics/ranking_metrics.py": "ded09a56bcccf01375c98889d1b4b7e19f71d621",
    "timeeval/metrics/latency_metrics.py": "bfe6d88a5e6c6668e202f756566aa81c06480400",
    "timeeval/core/experiments.py": "c0e4a42c3efa5bd53df3833565d3984801add2d6",
}
METHODS = ("space_jepa", "robust_zscore", "persistence")
BETA = 0.5
CATEGORY_SELECTIONS = {
    "anomaly_only": ["Anomaly"],
    "anomaly_plus_rare_event": ["Anomaly", "Rare Event"],
}
SHA256_RE = re.compile(r"^[0-9a-f]{64}$")


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def git_blob_sha1(path: Path) -> str:
    content = path.read_bytes()
    header = f"blob {len(content)}\0".encode("ascii")
    return hashlib.sha1(header + content).hexdigest()


def verify_upstream_source(root: Path) -> dict[str, str]:
    actual: dict[str, str] = {}
    for relative, expected in PINNED_UPSTREAM_BLOBS.items():
        path = root / relative
        if not path.is_file():
            raise ValueError(f"pinned ESA-ADB source file is missing: {relative}")
        observed = git_blob_sha1(path)
        if observed != expected:
            raise ValueError(
                f"ESA-ADB source drift for {relative}: expected Git blob {expected}, got {observed}"
            )
        actual[relative] = observed
    return actual


def verify_expected_sha256(path: Path, expected: str, label: str) -> str:
    if not SHA256_RE.fullmatch(expected):
        raise ValueError(f"{label} expected SHA-256 must be lowercase 64-hex")
    observed = sha256(path)
    if observed != expected:
        raise ValueError(f"{label} SHA-256 mismatch: expected {expected}, got {observed}")
    return observed


def load_receipt(path: Path) -> dict[str, Any]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(payload, dict):
        raise ValueError("channel receipt must be a JSON object")
    if payload.get("status") != "PRE_OUTCOME_MATCHED_CHANNEL_SURFACES_NOT_OFFICIAL_RESULT":
        raise ValueError("channel receipt status is not the frozen matched-surface status")
    if payload.get("annotation_columns_loaded") is not False:
        raise ValueError("channel receipt does not attest annotation_columns_loaded=false")
    if payload.get("anomaly_label_access") is not False:
        raise ValueError("channel receipt does not attest anomaly_label_access=false")
    channels = payload.get("channels")
    if not isinstance(channels, list) or not channels or any(not isinstance(c, str) for c in channels):
        raise ValueError("channel receipt is missing exact ordered channels")
    if len(set(channels)) != len(channels):
        raise ValueError("channel receipt contains duplicate channels")
    artifacts = payload.get("artifacts")
    if not isinstance(artifacts, dict) or set(artifacts) != set(METHODS):
        raise ValueError("channel receipt must retain exactly the frozen three method artifacts")
    return payload


def load_method_surface(
    receipt_path: Path,
    receipt: dict[str, Any],
    method: str,
) -> tuple[pd.DatetimeIndex, tuple[str, ...], np.ndarray]:
    if method not in METHODS:
        raise ValueError(f"unsupported frozen method: {method}")
    artifact = receipt["artifacts"].get(method)
    if not isinstance(artifact, dict):
        raise ValueError(f"receipt is missing artifact for {method}")
    relative = artifact.get("path")
    expected_sha = artifact.get("sha256")
    if not isinstance(relative, str) or Path(relative).name != relative:
        raise ValueError(f"{method} artifact path must be a sibling filename")
    if not isinstance(expected_sha, str) or not SHA256_RE.fullmatch(expected_sha):
        raise ValueError(f"{method} artifact SHA-256 is invalid")
    path = receipt_path.parent / relative
    verify_expected_sha256(path, expected_sha, f"{method} channel surface")

    channels = tuple(receipt["channels"])
    required = ["timestamp"]
    for channel in channels:
        required.extend([f"{channel}_score", f"{channel}_pred"])
    frame = pd.read_csv(path)
    if list(frame.columns) != required:
        raise ValueError(f"{method} channel surface columns/order do not match frozen contract")
    timestamps = pd.to_datetime(frame["timestamp"], errors="raise")
    if timestamps.isna().any() or timestamps.duplicated().any() or not timestamps.is_monotonic_increasing:
        raise ValueError(f"{method} timestamps must be unique and monotonically increasing")
    predictions = frame[[f"{c}_pred" for c in channels]].to_numpy()
    if predictions.shape != (len(frame), len(channels)):
        raise ValueError(f"{method} prediction geometry is invalid")
    if not np.isin(predictions, [0, 1]).all():
        raise ValueError(f"{method} predictions must be binary 0/1")
    scores = frame[[f"{c}_score" for c in channels]].to_numpy(dtype=np.float64)
    if not np.isfinite(scores).all():
        raise ValueError(f"{method} continuous channel scores must be finite")
    return pd.DatetimeIndex(timestamps), channels, predictions.astype(np.uint8, copy=False)


def load_ground_truth(
    labels_csv: Path,
    anomaly_types_csv: Path,
    channels_csv: Path,
    channels: tuple[str, ...],
    timestamps: pd.DatetimeIndex,
) -> tuple[pd.DataFrame, dict[str, list[str]]]:
    labels = pd.read_csv(labels_csv, parse_dates=["StartTime", "EndTime"])
    required_label_columns = {"ID", "Channel", "StartTime", "EndTime"}
    if not required_label_columns.issubset(labels.columns):
        raise ValueError("labels.csv is missing required ESA event columns")
    if labels[["StartTime", "EndTime"]].isna().any().any():
        raise ValueError("labels.csv contains unparseable event timestamps")
    labels["StartTime"] = labels["StartTime"].dt.tz_localize(None)
    labels["EndTime"] = labels["EndTime"].dt.tz_localize(None)

    anomaly_types = pd.read_csv(anomaly_types_csv)
    if "ID" not in anomaly_types.columns or anomaly_types["ID"].duplicated().any():
        raise ValueError("anomaly_types.csv must contain one unique row per ID")
    type_columns = [c for c in anomaly_types.columns if c != "ID"]
    if len(type_columns) < 1:
        raise ValueError("anomaly_types.csv contains no annotation-type columns")
    labels = labels.merge(anomaly_types, on="ID", how="left", validate="many_to_one")
    if "Category" not in labels.columns:
        raise ValueError("merged ESA labels are missing Category")

    labels = labels[labels["Channel"].isin(channels)].copy()
    start = timestamps.min().tz_localize(None) if timestamps.min().tzinfo is not None else timestamps.min()
    end = timestamps.max().tz_localize(None) if timestamps.max().tzinfo is not None else timestamps.max()
    labels = labels[(labels["StartTime"] >= start) & (labels["EndTime"] <= end)].copy()

    channel_meta = pd.read_csv(channels_csv)
    if not {"Channel", "Subsystem"}.issubset(channel_meta.columns):
        raise ValueError("channels.csv must contain Channel and Subsystem")
    relevant = channel_meta[channel_meta["Channel"].isin(channels)].copy()
    missing_channels = sorted(set(channels) - set(relevant["Channel"]))
    if missing_channels:
        raise ValueError(f"channels.csv is missing frozen channels: {missing_channels}")
    subsystems = {
        str(name): [str(c) for c in group["Channel"] if str(c) in channels]
        for name, group in relevant.groupby("Subsystem", sort=True)
    }
    subsystems = {name: members for name, members in subsystems.items() if members}
    return labels, subsystems


def prediction_dict(
    timestamps: pd.DatetimeIndex,
    channels: tuple[str, ...],
    predictions: np.ndarray,
) -> dict[str, np.ndarray]:
    result: dict[str, np.ndarray] = {}
    timestamp_values = timestamps.to_pydatetime()
    for index, channel in enumerate(channels):
        values = np.empty((len(timestamps), 2), dtype=object)
        values[:, 0] = timestamp_values
        values[:, 1] = predictions[:, index].astype(np.uint8)
        result[channel] = values
    return result


def _load_pinned_metric(root: Path):
    root_string = str(root.resolve())
    sys.path.insert(0, root_string)
    try:
        module = importlib.import_module("timeeval.metrics")
        metric = getattr(module, "ChannelAwareFScore")
    finally:
        try:
            sys.path.remove(root_string)
        except ValueError:
            pass
    source_file = Path(sys.modules[metric.__module__].__file__).resolve()
    expected_file = (root / "timeeval/metrics/ranking_metrics.py").resolve()
    if source_file != expected_file:
        raise ValueError(
            f"ChannelAwareFScore imported from unexpected source: {source_file}; expected {expected_file}"
        )
    return metric


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Evaluate frozen Space-JEPA matched channel surfaces with pinned ESA-ADB ChannelAwareFScore."
    )
    parser.add_argument("channel_receipt", type=Path)
    parser.add_argument("labels_csv", type=Path)
    parser.add_argument("anomaly_types_csv", type=Path)
    parser.add_argument("channels_csv", type=Path)
    parser.add_argument("--esa-adb-root", type=Path, required=True)
    parser.add_argument("--labels-sha256", required=True)
    parser.add_argument("--anomaly-types-sha256", required=True)
    parser.add_argument("--channels-sha256", required=True)
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    if args.out.exists():
        raise FileExistsError(f"refusing to overwrite retained metric result: {args.out}")
    upstream_blobs = verify_upstream_source(args.esa_adb_root)
    metadata_hashes = {
        "labels_csv": verify_expected_sha256(args.labels_csv, args.labels_sha256, "labels.csv"),
        "anomaly_types_csv": verify_expected_sha256(
            args.anomaly_types_csv, args.anomaly_types_sha256, "anomaly_types.csv"
        ),
        "channels_csv": verify_expected_sha256(args.channels_csv, args.channels_sha256, "channels.csv"),
    }
    receipt = load_receipt(args.channel_receipt)
    receipt_sha = sha256(args.channel_receipt)

    loaded: dict[str, tuple[pd.DatetimeIndex, tuple[str, ...], np.ndarray]] = {
        method: load_method_surface(args.channel_receipt, receipt, method) for method in METHODS
    }
    reference_timestamps, reference_channels, _ = loaded["space_jepa"]
    for method, (timestamps, channels, _) in loaded.items():
        if not timestamps.equals(reference_timestamps) or channels != reference_channels:
            raise ValueError(f"{method} surface is not aligned to the frozen Space-JEPA surface")

    labels, subsystems = load_ground_truth(
        args.labels_csv,
        args.anomaly_types_csv,
        args.channels_csv,
        reference_channels,
        reference_timestamps,
    )
    ChannelAwareFScore = _load_pinned_metric(args.esa_adb_root)

    results: dict[str, dict[str, dict[str, float]]] = {}
    for method, (timestamps, channels, predictions) in loaded.items():
        y_pred = prediction_dict(timestamps, channels, predictions)
        method_results: dict[str, dict[str, float]] = {}
        for selection_name, categories in CATEGORY_SELECTIONS.items():
            metric = ChannelAwareFScore(
                beta=BETA,
                select_labels={"Category": categories},
            )
            # Upstream mutates prediction arrays when extending to full_range; isolate each evaluation.
            score = metric.score(labels.copy(), {k: v.copy() for k, v in y_pred.items()}, subsystems)
            method_results[selection_name] = {key: float(value) for key, value in score.items()}
        results[method] = method_results

    payload = {
        "schema_version": 1,
        "status": "OFFICIAL_PINNED_ESADB_CHANNEL_AWARE_FSCORE_RESULT",
        "upstream": {
            "repository": "kplabs-pl/ESA-ADB",
            "commit": PINNED_ESA_ADB_COMMIT,
            "verified_git_blobs": upstream_blobs,
        },
        "channel_receipt_sha256": receipt_sha,
        "benchmark_metadata_sha256": metadata_hashes,
        "channels": list(reference_channels),
        "beta": BETA,
        "category_selections": CATEGORY_SELECTIONS,
        "methods": list(METHODS),
        "results": results,
        "claim_boundary": (
            "ChannelAwareFScore measures channel/subsystem detection under the pinned ESA-ADB metric. "
            "It is not causal attribution or root-cause identification. All frozen seeds must be "
            "retained before paper-level comparison claims are made."
        ),
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    print(json.dumps(payload, indent=2, sort_keys=True))


if __name__ == "__main__":
    main()
