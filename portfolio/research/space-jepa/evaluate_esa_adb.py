from __future__ import annotations

import argparse
import json
from pathlib import Path

import pandas as pd


def prepare_ground_truth(labels_csv: Path, anomaly_types_csv: Path, start: pd.Timestamp, end: pd.Timestamp) -> pd.DataFrame:
    labels = pd.read_csv(labels_csv)
    types = pd.read_csv(anomaly_types_csv)
    required_labels = {"ID", "StartTime", "EndTime"}
    required_types = {"ID", "Category"}
    if missing := required_labels - set(labels.columns):
        raise ValueError(f"labels.csv missing columns: {sorted(missing)}")
    if missing := required_types - set(types.columns):
        raise ValueError(f"anomaly_types.csv missing columns: {sorted(missing)}")

    labels["ID"] = labels["ID"].astype(str)
    types["ID"] = types["ID"].astype(str)
    labels["StartTime"] = pd.to_datetime(labels["StartTime"], utc=True).dt.tz_convert(None)
    labels["EndTime"] = pd.to_datetime(labels["EndTime"], utc=True).dt.tz_convert(None)
    metadata_columns = [c for c in types.columns if c != "ID"]
    merged = labels.merge(types[["ID", *metadata_columns]], on="ID", how="left", validate="many_to_one")
    merged = merged[(merged["EndTime"] >= start) & (merged["StartTime"] <= end)].copy()
    merged["StartTime"] = merged["StartTime"].clip(lower=start)
    merged["EndTime"] = merged["EndTime"].clip(upper=end)
    if merged.empty:
        raise ValueError("no ESA-ADB ground-truth events overlap prediction range")
    return merged


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Evaluate frozen Space-JEPA binary predictions with the official ESA-ADB ESAScores metric."
    )
    parser.add_argument("predictions_csv", type=Path)
    parser.add_argument("labels_csv", type=Path)
    parser.add_argument("anomaly_types_csv", type=Path)
    parser.add_argument("--prediction-column", default="space_jepa_pred")
    parser.add_argument("--out", type=Path, default=Path("official_esa_scores.json"))
    args = parser.parse_args()

    try:
        from timeeval.metrics import ESAScores
    except ImportError as exc:
        raise SystemExit(
            "Official ESA-ADB TimeEval fork is not importable. Run this script inside the official ESA-ADB environment/repository."
        ) from exc

    predictions = pd.read_csv(args.predictions_csv)
    required = {"timestamp", args.prediction_column}
    if missing := required - set(predictions.columns):
        raise ValueError(f"predictions CSV missing columns: {sorted(missing)}")
    predictions["timestamp"] = pd.to_datetime(predictions["timestamp"], utc=True).dt.tz_convert(None)
    predictions = predictions.sort_values("timestamp")
    if predictions["timestamp"].duplicated().any():
        raise ValueError("prediction timestamps must be unique")
    if not predictions[args.prediction_column].isin([0, 1]).all():
        raise ValueError("official ESA scoring requires frozen binary predictions")

    start = predictions["timestamp"].iloc[0]
    end = predictions["timestamp"].iloc[-1]
    ground_truth = prepare_ground_truth(args.labels_csv, args.anomaly_types_csv, start, end)
    y_pred = predictions[["timestamp", args.prediction_column]].to_numpy(dtype=object)
    full_range = (start, end)
    beta = 0.5
    metric_specs = {
        "anomaly_only": {"Category": ["Anomaly"]},
        "anomaly_plus_rare_event": {"Category": ["Rare Event", "Anomaly"]},
    }
    scores = {}
    for name, selector in metric_specs.items():
        metric = ESAScores(betas=beta, select_labels=selector, full_range=full_range)
        scores[name] = metric.score(ground_truth, y_pred)

    payload = {
        "status": "OFFICIAL_ESA_ADB_EVENT_METRIC_EVALUATION",
        "metric": "ESAScores",
        "beta": beta,
        "prediction_column": args.prediction_column,
        "prediction_range": [str(start), str(end)],
        "scores": scores,
        "note": "ChannelAwareFScore and ADTQC require per-channel rankings/timing outputs and are not claimed by the global latent-error head.",
    }
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(payload, indent=2, default=float) + "\n", encoding="utf-8")
    print(json.dumps(payload, indent=2, default=float))


if __name__ == "__main__":
    main()
