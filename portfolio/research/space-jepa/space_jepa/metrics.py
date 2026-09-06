from __future__ import annotations

from collections.abc import Sequence

import numpy as np


def _binary_inputs(y_true: np.ndarray, scores: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    y = np.asarray(y_true, dtype=np.int64).reshape(-1)
    s = np.asarray(scores, dtype=np.float64).reshape(-1)
    if y.shape != s.shape:
        raise ValueError("y_true and scores must have the same shape")
    if not np.isfinite(s).all():
        raise ValueError("scores must be finite")
    if not np.isin(y, [0, 1]).all():
        raise ValueError("y_true must contain only 0/1 labels")
    return y, s


def _multiclass_inputs(
    y_true: np.ndarray,
    probabilities: np.ndarray,
    class_labels: Sequence[int],
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    y = np.asarray(y_true).reshape(-1)
    p = np.asarray(probabilities, dtype=np.float64)
    labels = np.asarray(tuple(class_labels))
    if labels.ndim != 1 or labels.size < 2:
        raise ValueError("class_labels must contain at least two classes")
    if len(set(labels.tolist())) != labels.size:
        raise ValueError("class_labels must be unique")
    if p.ndim != 2 or p.shape != (y.size, labels.size):
        raise ValueError("probabilities must have shape (n_objects, n_classes)")
    if y.size == 0:
        raise ValueError("y_true cannot be empty")
    if not np.isfinite(p).all():
        raise ValueError("probabilities must be finite")
    if (p < 0.0).any():
        raise ValueError("probabilities must be non-negative")
    row_sums = p.sum(axis=1)
    if not np.isfinite(row_sums).all() or (row_sums <= 0.0).any():
        raise ValueError("each probability row must have a positive finite sum")
    known = np.isin(y, labels)
    if not known.all():
        unknown = np.unique(y[~known]).tolist()
        raise ValueError(f"y_true contains labels absent from class_labels: {unknown}")
    for label in labels:
        if not np.any(y == label):
            raise ValueError(f"class {label!r} has no confirmatory objects")
    normalized = p / row_sums[:, None]
    normalized = np.clip(normalized, 1e-15, 1.0 - 1e-15)
    return y, normalized, labels


def _true_class_nll(
    y_true: np.ndarray,
    probabilities: np.ndarray,
    class_labels: Sequence[int],
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    y, p, labels = _multiclass_inputs(y_true, probabilities, class_labels)
    column = {label: i for i, label in enumerate(labels.tolist())}
    true_columns = np.asarray([column[label] for label in y.tolist()], dtype=np.int64)
    nll = -np.log(p[np.arange(y.size), true_columns])
    return y, nll, labels


def class_balanced_multiclass_log_loss(
    y_true: np.ndarray,
    probabilities: np.ndarray,
    class_labels: Sequence[int],
) -> float:
    """Unweighted mean of per-class true-label log losses.

    Probability rows are first renormalized to sum to one and then clipped to
    [1e-15, 1-1e-15]. Every declared class must be represented in ``y_true``.
    This keeps the metric class-balanced and deterministic without depending on
    hidden challenge weights.
    """
    y, nll, labels = _true_class_nll(y_true, probabilities, class_labels)
    class_means = [float(nll[y == label].mean()) for label in labels]
    return float(np.mean(class_means))


def paired_class_balanced_log_loss_deltas(
    y_true: np.ndarray,
    time_aware_probabilities: np.ndarray,
    time_agnostic_probabilities: np.ndarray,
    class_labels: Sequence[int],
) -> np.ndarray:
    """Return one paired ``agnostic - aware`` class-balanced log-loss delta per seed."""
    aware = np.asarray(time_aware_probabilities, dtype=np.float64)
    agnostic = np.asarray(time_agnostic_probabilities, dtype=np.float64)
    if aware.ndim != 3 or agnostic.ndim != 3:
        raise ValueError("seeded probabilities must have shape (n_seeds, n_objects, n_classes)")
    if aware.shape != agnostic.shape:
        raise ValueError("time-aware and time-agnostic probability tensors must match")
    if aware.shape[0] == 0:
        raise ValueError("at least one model seed is required")
    deltas = []
    for seed_index in range(aware.shape[0]):
        aware_loss = class_balanced_multiclass_log_loss(y_true, aware[seed_index], class_labels)
        agnostic_loss = class_balanced_multiclass_log_loss(y_true, agnostic[seed_index], class_labels)
        deltas.append(agnostic_loss - aware_loss)
    return np.asarray(deltas, dtype=np.float64)


def paired_hierarchical_log_loss_bootstrap(
    y_true: np.ndarray,
    time_aware_probabilities: np.ndarray,
    time_agnostic_probabilities: np.ndarray,
    class_labels: Sequence[int],
    *,
    replicates: int = 10_000,
    bootstrap_seed: int = 20_260_906,
) -> np.ndarray:
    """Paired hierarchical bootstrap for the frozen PLAsTiCC primary effect.

    Each replicate resamples model seeds with replacement. For every selected
    seed it then resamples confirmatory objects with replacement *within each
    true class*. The replicate effect is the mean across selected seeds of the
    unweighted mean class-specific ``agnostic - aware`` true-label NLL delta.
    """
    if replicates <= 0:
        raise ValueError("replicates must be positive")
    aware = np.asarray(time_aware_probabilities, dtype=np.float64)
    agnostic = np.asarray(time_agnostic_probabilities, dtype=np.float64)
    if aware.ndim != 3 or agnostic.ndim != 3 or aware.shape != agnostic.shape:
        raise ValueError("seeded probability tensors must have identical (n_seeds, n_objects, n_classes) shape")
    n_seeds, n_objects, _ = aware.shape
    if n_seeds == 0:
        raise ValueError("at least one model seed is required")

    y, aware0, labels = _multiclass_inputs(y_true, aware[0], class_labels)
    if n_objects != y.size:
        raise ValueError("probability object count must match y_true")
    # Validate and normalize every seed before any resampling. The first aware
    # seed was already validated above; rebuilding all arrays keeps the logic
    # simple and guarantees identical normalization for both arms.
    aware_norm = np.empty_like(aware, dtype=np.float64)
    agnostic_norm = np.empty_like(agnostic, dtype=np.float64)
    aware_norm[0] = aware0
    for seed_index in range(n_seeds):
        if seed_index > 0:
            _, aware_norm[seed_index], _ = _multiclass_inputs(y, aware[seed_index], labels)
        _, agnostic_norm[seed_index], _ = _multiclass_inputs(y, agnostic[seed_index], labels)

    column = {label: i for i, label in enumerate(labels.tolist())}
    true_columns = np.asarray([column[label] for label in y.tolist()], dtype=np.int64)
    rows = np.arange(n_objects)
    aware_nll = -np.log(aware_norm[:, rows, true_columns])
    agnostic_nll = -np.log(agnostic_norm[:, rows, true_columns])
    per_object_delta = agnostic_nll - aware_nll
    class_indices = [np.flatnonzero(y == label) for label in labels]

    rng = np.random.default_rng(bootstrap_seed)
    boot = np.empty(replicates, dtype=np.float64)
    for replicate in range(replicates):
        selected_seeds = rng.integers(0, n_seeds, size=n_seeds)
        seed_effects = np.empty(n_seeds, dtype=np.float64)
        for position, seed_index in enumerate(selected_seeds):
            class_effects = np.empty(labels.size, dtype=np.float64)
            for class_position, indices in enumerate(class_indices):
                sampled = rng.choice(indices, size=indices.size, replace=True)
                class_effects[class_position] = per_object_delta[seed_index, sampled].mean()
            seed_effects[position] = class_effects.mean()
        boot[replicate] = seed_effects.mean()
    return boot


def plasticc_primary_decision(
    y_true: np.ndarray,
    time_aware_probabilities: np.ndarray,
    time_agnostic_probabilities: np.ndarray,
    class_labels: Sequence[int],
    *,
    practical_effect_threshold: float = 0.02,
    required_positive_seeds: int = 4,
    replicates: int = 10_000,
    bootstrap_seed: int = 20_260_906,
) -> dict[str, object]:
    """Evaluate the frozen three-part PLAsTiCC primary decision rule.

    This function is deterministic for fixed inputs and bootstrap seed. It does
    not load data, choose thresholds, tune models, or authorize held-out access.
    """
    if practical_effect_threshold < 0.0:
        raise ValueError("practical_effect_threshold must be non-negative")
    deltas = paired_class_balanced_log_loss_deltas(
        y_true, time_aware_probabilities, time_agnostic_probabilities, class_labels
    )
    if not 1 <= required_positive_seeds <= deltas.size:
        raise ValueError("required_positive_seeds must be between 1 and n_seeds")
    boot = paired_hierarchical_log_loss_bootstrap(
        y_true,
        time_aware_probabilities,
        time_agnostic_probabilities,
        class_labels,
        replicates=replicates,
        bootstrap_seed=bootstrap_seed,
    )
    lower, upper = np.percentile(boot, [2.5, 97.5])
    mean_delta = float(deltas.mean())
    positive_seed_count = int((deltas > 0.0).sum())
    success = bool(
        mean_delta >= practical_effect_threshold
        and float(lower) > 0.0
        and positive_seed_count >= required_positive_seeds
    )
    return {
        "mean_seed_delta": mean_delta,
        "seed_deltas": deltas.tolist(),
        "positive_seed_count": positive_seed_count,
        "bootstrap_95pct_lower": float(lower),
        "bootstrap_95pct_upper": float(upper),
        "practical_effect_threshold": float(practical_effect_threshold),
        "required_positive_seeds": int(required_positive_seeds),
        "bootstrap_replicates": int(replicates),
        "bootstrap_seed": int(bootstrap_seed),
        "primary_success": success,
    }


def threshold_from_nominal(scores: np.ndarray, quantile: float = 0.995) -> float:
    scores = np.asarray(scores, dtype=np.float64).reshape(-1)
    if scores.size == 0:
        raise ValueError("scores cannot be empty")
    if not np.isfinite(scores).all():
        raise ValueError("scores must be finite")
    if not 0.0 < quantile < 1.0:
        raise ValueError("quantile must be in (0, 1)")
    return float(np.quantile(scores, quantile))


def point_metrics(y_true: np.ndarray, scores: np.ndarray, threshold: float) -> dict[str, float]:
    y, s = _binary_inputs(y_true, scores)
    p = s >= threshold
    t = y.astype(bool)
    tp = int(np.logical_and(p, t).sum())
    fp = int(np.logical_and(p, ~t).sum())
    fn = int(np.logical_and(~p, t).sum())
    tn = int(np.logical_and(~p, ~t).sum())
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "tp": float(tp),
        "fp": float(fp),
        "fn": float(fn),
        "tn": float(tn),
    }


def auroc(y_true: np.ndarray, scores: np.ndarray) -> float:
    """Exact binary AUROC in O(n log n) time and O(n) memory.

    This is the Mann-Whitney U / average-rank formulation. Equal scores receive average ranks,
    preserving the standard half-credit treatment of ties without materializing a pos×neg matrix.
    """
    y, s = _binary_inputs(y_true, scores)
    n_pos = int((y == 1).sum())
    n_neg = int((y == 0).sum())
    if n_pos == 0 or n_neg == 0:
        return float("nan")

    order = np.argsort(s, kind="mergesort")
    sorted_scores = s[order]
    ranks = np.empty(len(s), dtype=np.float64)
    i = 0
    while i < len(s):
        j = i + 1
        while j < len(s) and sorted_scores[j] == sorted_scores[i]:
            j += 1
        # Ranks are 1-based. Average rank for positions i..j-1 is ((i+1)+j)/2.
        ranks[order[i:j]] = ((i + 1) + j) / 2.0
        i = j

    rank_sum_pos = float(ranks[y == 1].sum())
    u = rank_sum_pos - n_pos * (n_pos + 1) / 2.0
    return float(u / (n_pos * n_neg))


def average_precision(y_true: np.ndarray, scores: np.ndarray) -> float:
    y, s = _binary_inputs(y_true, scores)
    positives = int((y == 1).sum())
    if positives == 0:
        return float("nan")
    order = np.argsort(-s, kind="stable")
    ranked = y[order]
    tp = np.cumsum(ranked == 1)
    fp = np.cumsum(ranked == 0)
    precision = tp / np.maximum(tp + fp, 1)
    return float(precision[ranked == 1].sum() / positives)


def contiguous_events(binary: np.ndarray) -> list[tuple[int, int]]:
    a = np.asarray(binary, dtype=bool).reshape(-1)
    if not a.size:
        return []
    padded = np.pad(a.astype(np.int8), (1, 1))
    diff = np.diff(padded)
    starts = np.flatnonzero(diff == 1)
    ends = np.flatnonzero(diff == -1)
    return list(zip(starts.tolist(), ends.tolist(), strict=True))


def event_f1(y_true: np.ndarray, scores: np.ndarray, threshold: float) -> dict[str, float]:
    y, s = _binary_inputs(y_true, scores)
    true_events = contiguous_events(y > 0)
    pred_events = contiguous_events(s >= threshold)

    # One-to-one greedy overlap matching. A single broad prediction cannot claim credit for
    # multiple distinct ground-truth events, and duplicate predictions cannot claim one event twice.
    matched_true: set[int] = set()
    matched_pred: set[int] = set()
    for pi, (pa, pb) in enumerate(pred_events):
        for ti, (ta, tb) in enumerate(true_events):
            if ti in matched_true:
                continue
            if max(pa, ta) < min(pb, tb):
                matched_pred.add(pi)
                matched_true.add(ti)
                break

    tp = len(matched_true)
    fp = len(pred_events) - len(matched_pred)
    fn = len(true_events) - len(matched_true)
    precision = tp / (tp + fp) if tp + fp else 0.0
    recall = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
    return {
        "event_precision": precision,
        "event_recall": recall,
        "event_f1": f1,
        "true_events": float(len(true_events)),
        "pred_events": float(len(pred_events)),
    }
