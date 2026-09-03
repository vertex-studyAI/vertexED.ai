from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import csv

import numpy as np


@dataclass(frozen=True)
class RobustScaler:
    center: np.ndarray
    scale: np.ndarray

    @classmethod
    def fit(cls, x_train: np.ndarray, eps: float = 1e-6) -> "RobustScaler":
        x_train = np.asarray(x_train, dtype=np.float32)
        if x_train.ndim != 2:
            raise ValueError("telemetry must have shape [time, channels]")
        center = np.nanmedian(x_train, axis=0)
        mad = np.nanmedian(np.abs(x_train - center), axis=0)
        scale = 1.4826 * mad
        fallback = np.nanstd(x_train, axis=0)
        scale = np.where(scale > eps, scale, np.where(fallback > eps, fallback, 1.0))
        return cls(center.astype(np.float32), scale.astype(np.float32))

    def transform(self, x: np.ndarray) -> np.ndarray:
        x = np.asarray(x, dtype=np.float32)
        return np.nan_to_num((x - self.center) / self.scale, nan=0.0, posinf=0.0, neginf=0.0)


@dataclass(frozen=True)
class WindowBatch:
    context: np.ndarray
    target: np.ndarray
    target_labels: np.ndarray | None
    starts: np.ndarray


def make_windows(
    x: np.ndarray,
    context_length: int,
    target_length: int,
    *,
    stride: int = 1,
    labels: np.ndarray | None = None,
) -> WindowBatch:
    x = np.asarray(x, dtype=np.float32)
    if x.ndim != 2:
        raise ValueError("x must have shape [time, channels]")
    if context_length < 1 or target_length < 1 or stride < 1:
        raise ValueError("context_length, target_length and stride must be positive")
    total = context_length + target_length
    if len(x) < total:
        raise ValueError(f"need at least {total} timesteps, got {len(x)}")
    starts = np.arange(0, len(x) - total + 1, stride, dtype=np.int64)
    context = np.stack([x[s : s + context_length] for s in starts])
    target = np.stack([x[s + context_length : s + total] for s in starts])
    target_labels = None
    if labels is not None:
        labels = np.asarray(labels, dtype=np.int64)
        if len(labels) != len(x):
            raise ValueError("labels length must match telemetry length")
        target_labels = np.stack([labels[s + context_length : s + total] for s in starts])
    return WindowBatch(context=context, target=target, target_labels=target_labels, starts=starts)


def _label_column(fieldnames: list[str]) -> str | None:
    candidates = ("is_anomaly", "anomaly", "label", "target", "y")
    lower = {name.lower(): name for name in fieldnames}
    return next((lower[c] for c in candidates if c in lower), None)


def _column_is_numeric(rows: list[dict[str, str]], name: str) -> bool:
    saw_number = False
    for row in rows:
        value = (row.get(name) or "").strip()
        if value == "":
            continue
        try:
            float(value)
        except ValueError:
            return False
        saw_number = True
    return saw_number


def _float_or_nan(value: str | None) -> float:
    value = (value or "").strip()
    return float(value) if value else float("nan")


def load_csv(path: str | Path, label_column: str | None = None) -> tuple[np.ndarray, np.ndarray | None, list[str]]:
    """Load a flat telemetry CSV after benchmark-specific preprocessing.

    Nonnumeric timestamp/id columns are ignored. Numeric telemetry columns may contain blank cells,
    which are represented as NaN and then handled by train-fit normalization. Labels are optional;
    discovery supports common names. This adapter does not replace ESA-ADB's official preprocessing.
    """
    path = Path(path)
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        if not reader.fieldnames:
            raise ValueError("CSV has no header")
        rows = list(reader)
        if not rows:
            raise ValueError("CSV has no data rows")
        label_column = label_column or _label_column(reader.fieldnames)
        if label_column and label_column not in reader.fieldnames:
            raise ValueError(f"label column {label_column!r} not found")

        numeric_columns = [
            name
            for name in reader.fieldnames
            if name != label_column and _column_is_numeric(rows, name)
        ]
        if not numeric_columns:
            raise ValueError("no numeric telemetry columns found")

        x = np.asarray(
            [[_float_or_nan(row.get(c)) for c in numeric_columns] for row in rows],
            dtype=np.float32,
        )
        y = None
        if label_column:
            if any((row.get(label_column) or "").strip() == "" for row in rows):
                raise ValueError("label column contains blank values")
            y = np.asarray([int(float(row[label_column])) for row in rows], dtype=np.int64)
            if not np.isin(y, [0, 1]).all():
                raise ValueError("label column must be binary 0/1")
        return x, y, numeric_columns


def synthetic_telemetry(
    n_steps: int = 1800,
    n_features: int = 8,
    *,
    anomaly_start: int = 1200,
    seed: int = 17,
) -> tuple[np.ndarray, np.ndarray]:
    """Deterministic smoke fixture; never use as research evidence."""
    rng = np.random.default_rng(seed)
    t = np.linspace(0.0, 60.0, n_steps, dtype=np.float32)
    channels = []
    for i in range(n_features):
        phase = i * 0.37
        base = np.sin(t * (0.08 + i * 0.011) + phase) + 0.35 * np.cos(t * 0.023 * (i + 1))
        channels.append(base)
    x = np.stack(channels, axis=1).astype(np.float32)
    x += rng.normal(0.0, 0.04, size=x.shape).astype(np.float32)
    y = np.zeros(n_steps, dtype=np.int64)
    if anomaly_start < n_steps:
        segments = [
            (anomaly_start, min(anomaly_start + 35, n_steps), 0, 3.5),
            (min(anomaly_start + 150, n_steps), min(anomaly_start + 190, n_steps), min(2, n_features - 1), -2.8),
            (min(anomaly_start + 330, n_steps), min(anomaly_start + 390, n_steps), min(5, n_features - 1), 2.2),
        ]
        for a, b, c, magnitude in segments:
            if a < b:
                x[a:b, c] += magnitude
                y[a:b] = 1
    return x, y
