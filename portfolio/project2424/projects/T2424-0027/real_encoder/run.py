from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import platform
import shutil
import subprocess
import sys
from collections import defaultdict
from pathlib import Path
from typing import Any, Dict, Iterable, List, Sequence, Tuple

import numpy as np
from datasets import load_dataset
from sentence_transformers import SentenceTransformer


HERE = Path(__file__).resolve().parent


def read_json(path: Path) -> Dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def stable_rank(seed: int, record_id: str, salt: str) -> str:
    payload = f"{seed}:{salt}:{record_id}".encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def label_name(feature: Any, value: Any) -> str:
    names = getattr(feature, "names", None)
    if names is not None and isinstance(value, (int, np.integer)):
        return str(names[int(value)])
    return str(value)


def materialize_locale(
    repo: str,
    revision: str,
    locale: str,
    fit_split: str,
    eval_split: str,
) -> Tuple[List[Dict[str, str]], List[Dict[str, str]], Dict[str, Any]]:
    ds = load_dataset(repo, locale, revision=revision, trust_remote_code=True)
    if fit_split not in ds or eval_split not in ds:
        raise RuntimeError(f"{locale}: required splits {fit_split}/{eval_split} not found: {list(ds.keys())}")

    def rows(split_name: str) -> List[Dict[str, str]]:
        split = ds[split_name]
        intent_feature = split.features["intent"]
        out: List[Dict[str, str]] = []
        for row in split:
            rid = str(row["id"])
            out.append(
                {
                    "id": rid,
                    "locale": locale,
                    "intent": label_name(intent_feature, row["intent"]),
                    "text": str(row["utt"]),
                }
            )
        return out

    meta = {
        "locale": locale,
        "fit_split": fit_split,
        "fit_rows": len(ds[fit_split]),
        "fit_fingerprint": getattr(ds[fit_split], "_fingerprint", None),
        "evaluation_split": eval_split,
        "evaluation_rows": len(ds[eval_split]),
        "evaluation_fingerprint": getattr(ds[eval_split], "_fingerprint", None),
    }
    return rows(fit_split), rows(eval_split), meta


def select_cells(records: Sequence[Dict[str, str]], seed: int, n: int, split_salt: str) -> List[Dict[str, str]]:
    grouped: Dict[Tuple[str, str], List[Dict[str, str]]] = defaultdict(list)
    for record in records:
        grouped[(record["locale"], record["intent"])].append(record)

    selected: List[Dict[str, str]] = []
    for key in sorted(grouped):
        cell = sorted(grouped[key], key=lambda r: stable_rank(seed, r["id"], split_salt))
        if len(cell) < n:
            raise RuntimeError(f"Cell {key} has {len(cell)} rows; protocol requires {n}.")
        selected.extend(cell[:n])
    return selected


def centroid_predict(x_fit: np.ndarray, y_fit: Sequence[str], x_eval: np.ndarray) -> np.ndarray:
    labels = sorted(set(y_fit))
    centroids = np.stack([x_fit[np.array(y_fit) == label].mean(axis=0) for label in labels], axis=0)
    d2 = ((x_eval[:, None, :] - centroids[None, :, :]) ** 2).sum(axis=-1)
    return np.asarray([labels[i] for i in np.argmin(d2, axis=1)], dtype=object)


def accuracy(y_true: Sequence[str], y_pred: Sequence[str]) -> float:
    if len(y_true) == 0:
        return float("nan")
    return float(np.mean(np.asarray(y_true, dtype=object) == np.asarray(y_pred, dtype=object)))


def evaluate_probe(x_fit: np.ndarray, fit_rows: Sequence[Dict[str, str]], x_eval: np.ndarray, eval_rows: Sequence[Dict[str, str]]) -> Dict[str, float]:
    fit_intent = [r["intent"] for r in fit_rows]
    eval_intent = [r["intent"] for r in eval_rows]
    fit_locale = [r["locale"] for r in fit_rows]
    eval_locale = [r["locale"] for r in eval_rows]
    return {
        "intent_accuracy": accuracy(eval_intent, centroid_predict(x_fit, fit_intent, x_eval)),
        "language_accuracy": accuracy(eval_locale, centroid_predict(x_fit, fit_locale, x_eval)),
    }


def subtract_group_centroids(
    x_fit: np.ndarray,
    fit_groups: Sequence[str],
    x_eval: np.ndarray,
    eval_groups: Sequence[str],
) -> Tuple[np.ndarray, np.ndarray]:
    groups = sorted(set(fit_groups))
    means = {group: x_fit[np.asarray(fit_groups, dtype=object) == group].mean(axis=0) for group in groups}
    missing = sorted(set(eval_groups) - set(groups))
    if missing:
        raise RuntimeError(f"Evaluation groups missing from fit split: {missing}")
    fit_out = np.stack([x - means[g] for x, g in zip(x_fit, fit_groups)], axis=0)
    eval_out = np.stack([x - means[g] for x, g in zip(x_eval, eval_groups)], axis=0)
    return fit_out, eval_out


def random_group(seed: int, record: Dict[str, str], groups: int = 3) -> str:
    digest = stable_rank(seed, f"{record['locale']}:{record['id']}", "random-group")
    return f"g{int(digest[:16], 16) % groups}"


def remove_random_subspace(x_fit: np.ndarray, x_eval: np.ndarray, seed: int, rank: int = 2) -> Tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    basis = rng.standard_normal((x_fit.shape[1], rank))
    q, _ = np.linalg.qr(basis)
    q = q[:, :rank]
    return x_fit - (x_fit @ q) @ q.T, x_eval - (x_eval @ q) @ q.T


def normalized_reduction(raw_language: float, transformed_language: float, chance: float) -> float:
    denominator = raw_language - chance
    if denominator <= 0:
        return float("nan")
    return float((raw_language - transformed_language) / denominator)


def finite_mean(values: Iterable[float]) -> float:
    xs = [float(v) for v in values if math.isfinite(float(v))]
    return float(np.mean(xs)) if xs else float("nan")


def build_environment() -> Dict[str, Any]:
    try:
        freeze = subprocess.run(
            [sys.executable, "-m", "pip", "freeze"],
            check=True,
            capture_output=True,
            text=True,
        ).stdout.splitlines()
    except Exception:
        freeze = []
    return {
        "python": sys.version,
        "platform": platform.platform(),
        "executable": sys.executable,
        "pip_freeze": freeze,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Run frozen T2424-0027 real-encoder transfer gate.")
    parser.add_argument("--manifest", default=str(HERE / "manifest.json"))
    parser.add_argument("--out", default=str(HERE / "artifacts"))
    args = parser.parse_args()

    manifest_path = Path(args.manifest).resolve()
    out = Path(args.out).resolve()
    if out.exists():
        raise RuntimeError(f"Refusing to overwrite existing artifact directory: {out}")
    out.mkdir(parents=True)

    manifest = read_json(manifest_path)
    if manifest.get("status") != "FROZEN_BEFORE_OUTCOME_ACCESS" or not manifest.get("execution_authorized"):
        raise RuntimeError("Manifest is not frozen and execution-authorized.")

    shutil.copy2(manifest_path, out / "resolved_manifest.json")
    write_json(out / "environment.json", build_environment())

    dataset_cfg = manifest["dataset"]
    all_fit: List[Dict[str, str]] = []
    all_eval: List[Dict[str, str]] = []
    dataset_meta: List[Dict[str, Any]] = []
    for locale in dataset_cfg["locales"]:
        fit_rows, eval_rows, meta = materialize_locale(
            dataset_cfg["repo"],
            dataset_cfg["revision"],
            locale,
            dataset_cfg["splits"]["fit"],
            dataset_cfg["splits"]["evaluation"],
        )
        all_fit.extend(fit_rows)
        all_eval.extend(eval_rows)
        dataset_meta.append(meta)
    write_json(
        out / "dataset_fingerprint.json",
        {
            "repo": dataset_cfg["repo"],
            "revision": dataset_cfg["revision"],
            "dataset_version": dataset_cfg["dataset_version"],
            "locales": dataset_meta,
        },
    )

    selections: Dict[int, Tuple[List[Dict[str, str]], List[Dict[str, str]]]] = {}
    union: Dict[Tuple[str, str], Dict[str, str]] = {}
    for seed in manifest["seeds"]:
        fit = select_cells(all_fit, int(seed), 20, "fit")
        ev = select_cells(all_eval, int(seed), 20, "evaluation")
        selections[int(seed)] = (fit, ev)
        for record in fit + ev:
            union[(record["locale"], record["id"])] = record

    model_cfg = manifest["encoder"]
    model = SentenceTransformer(
        model_cfg["repo"],
        revision=model_cfg["revision"],
        device="cpu",
    )
    ordered_keys = sorted(union)
    texts = [union[key]["text"] for key in ordered_keys]
    embeddings = model.encode(
        texts,
        batch_size=64,
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=bool(model_cfg["normalize_embeddings"]),
    ).astype(np.float64, copy=False)
    embedding_by_key = {key: embeddings[i] for i, key in enumerate(ordered_keys)}
    write_json(
        out / "model_revision.json",
        {
            "repo": model_cfg["repo"],
            "revision": model_cfg["revision"],
            "embedding_dimension_observed": int(embeddings.shape[1]),
            "unique_utterances_encoded": len(ordered_keys),
            "normalize_embeddings": bool(model_cfg["normalize_embeddings"]),
            "device": "cpu",
        },
    )

    chance = float(manifest["metrics"]["language_chance"])
    parent_effect = float(manifest["parent_normalized_language_leakage_reduction"])
    seed_rows: List[Dict[str, Any]] = []

    for seed in manifest["seeds"]:
        seed = int(seed)
        fit_rows, eval_rows = selections[seed]
        x_fit = np.stack([embedding_by_key[(r["locale"], r["id"])] for r in fit_rows], axis=0)
        x_eval = np.stack([embedding_by_key[(r["locale"], r["id"])] for r in eval_rows], axis=0)

        raw = evaluate_probe(x_fit, fit_rows, x_eval, eval_rows)

        language_fit, language_eval = subtract_group_centroids(
            x_fit,
            [r["locale"] for r in fit_rows],
            x_eval,
            [r["locale"] for r in eval_rows],
        )
        language_centered = evaluate_probe(language_fit, fit_rows, language_eval, eval_rows)

        global_mean = x_fit.mean(axis=0)
        global_centered = evaluate_probe(x_fit - global_mean, fit_rows, x_eval - global_mean, eval_rows)

        rg_fit_groups = [random_group(seed, r) for r in fit_rows]
        rg_eval_groups = [random_group(seed, r) for r in eval_rows]
        random_group_fit, random_group_eval = subtract_group_centroids(
            x_fit, rg_fit_groups, x_eval, rg_eval_groups
        )
        random_group_metrics = evaluate_probe(random_group_fit, fit_rows, random_group_eval, eval_rows)

        rs_fit, rs_eval = remove_random_subspace(x_fit, x_eval, seed=seed, rank=2)
        random_subspace_metrics = evaluate_probe(rs_fit, fit_rows, rs_eval, eval_rows)

        reductions = {
            "language_centering": normalized_reduction(raw["language_accuracy"], language_centered["language_accuracy"], chance),
            "global_centering": normalized_reduction(raw["language_accuracy"], global_centered["language_accuracy"], chance),
            "random_group_centering": normalized_reduction(raw["language_accuracy"], random_group_metrics["language_accuracy"], chance),
            "random_subspace": normalized_reduction(raw["language_accuracy"], random_subspace_metrics["language_accuracy"], chance),
        }
        effect_retention = reductions["language_centering"] / parent_effect
        intent_drop = raw["intent_accuracy"] - language_centered["intent_accuracy"]
        specificity_margin = reductions["language_centering"] - max(
            reductions["global_centering"],
            reductions["random_group_centering"],
            reductions["random_subspace"],
        )
        gate = manifest["predeclared_success_gate"]
        seed_pass = bool(
            raw["language_accuracy"] >= float(gate["mean_raw_language_accuracy_min"])
            and effect_retention >= float(gate["mean_effect_retention_min"])
            and intent_drop <= float(gate["mean_intent_drop_max"])
            and specificity_margin >= float(gate["mean_specificity_margin_min"])
        )
        seed_rows.append(
            {
                "seed": seed,
                "raw": raw,
                "language_centered": language_centered,
                "global_centered": global_centered,
                "random_group_centered": random_group_metrics,
                "random_subspace": random_subspace_metrics,
                "normalized_reductions": reductions,
                "effect_retention": effect_retention,
                "intent_drop": intent_drop,
                "specificity_margin": specificity_margin,
                "predeclared_seed_pass": seed_pass,
            }
        )

    with (out / "per_seed_metrics.jsonl").open("w", encoding="utf-8") as handle:
        for row in seed_rows:
            handle.write(json.dumps(row, sort_keys=True) + "\n")

    summary = {
        "seed_count": len(seed_rows),
        "seed_passes": sum(bool(row["predeclared_seed_pass"]) for row in seed_rows),
        "mean_raw_intent_accuracy": finite_mean(row["raw"]["intent_accuracy"] for row in seed_rows),
        "mean_raw_language_accuracy": finite_mean(row["raw"]["language_accuracy"] for row in seed_rows),
        "mean_language_centered_intent_accuracy": finite_mean(row["language_centered"]["intent_accuracy"] for row in seed_rows),
        "mean_language_centered_language_accuracy": finite_mean(row["language_centered"]["language_accuracy"] for row in seed_rows),
        "mean_normalized_language_leakage_reduction": finite_mean(row["normalized_reductions"]["language_centering"] for row in seed_rows),
        "mean_effect_retention": finite_mean(row["effect_retention"] for row in seed_rows),
        "mean_intent_drop": finite_mean(row["intent_drop"] for row in seed_rows),
        "mean_specificity_margin": finite_mean(row["specificity_margin"] for row in seed_rows),
    }
    write_json(out / "summary.json", summary)

    gate = manifest["predeclared_success_gate"]
    overall_pass = bool(
        summary["seed_passes"] >= int(gate["required_seed_passes"])
        and summary["seed_count"] == int(gate["required_seed_count"])
        and summary["mean_raw_language_accuracy"] >= float(gate["mean_raw_language_accuracy_min"])
        and summary["mean_effect_retention"] >= float(gate["mean_effect_retention_min"])
        and summary["mean_intent_drop"] <= float(gate["mean_intent_drop_max"])
        and summary["mean_specificity_margin"] >= float(gate["mean_specificity_margin_min"])
    )
    falsifiers = {
        "effect_below_30pct_parent": summary["mean_effect_retention"] < 0.30,
        "intent_drop_over_5pct": summary["mean_intent_drop"] > 0.05,
        "generic_control_matches_or_beats": summary["mean_specificity_margin"] <= 0.0,
    }
    verdict = {
        "protocol_id": manifest["protocol_id"],
        "verdict": "PASS_REAL_ENCODER_TRANSFER_GATE" if overall_pass else "FAIL_PREDECLARED_REAL_ENCODER_GATE",
        "success_gate_passed": overall_pass,
        "falsifiers": falsifiers,
        "claim_boundary": manifest["claim_boundary"],
        "no_thresholds_moved_after_outcome_access": True,
    }
    write_json(out / "verdict.json", verdict)

    print(json.dumps({"summary": summary, "verdict": verdict}, indent=2))


if __name__ == "__main__":
    os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")
    os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")
    main()
