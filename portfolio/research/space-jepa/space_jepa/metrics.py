from __future__ import annotations

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
