from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import csv

import numpy as np


@dataclass(frozen=True)
class LightCurveSeries:
    times: np.ndarray
    values: np.ndarray
    errors: np.ndarray
    bands: np.ndarray
    labels: np.ndarray | None = None

    def validate(self) -> "LightCurveSeries":
        n = len(self.times)
        if n == 0:
            raise ValueError("light curve cannot be empty")
        if any(len(a) != n for a in (self.values, self.errors, self.bands)):
            raise ValueError("light-curve columns must have equal length")
        if self.labels is not None and len(self.labels) != n:
            raise ValueError("labels length must match observations")
        if not np.all(np.diff(self.times) >= 0):
            raise ValueError("observations must be sorted by time")
        return self


@dataclass(frozen=True)
class LightCurveFeaturizer:
    """Train-fit featurizer for irregular photometric event sequences.

    Continuous features are robust-scaled using only the training prefix or the explicitly
    supplied collection of training objects. Passbands use a training-derived vocabulary plus
    an explicit `<UNK>` bucket, so held-out bands cannot alter dimensionality or training
    statistics.
    """

    center: np.ndarray
    scale: np.ndarray
    bands: tuple[str, ...]

    @staticmethod
    def _continuous(series: LightCurveSeries) -> np.ndarray:
        series.validate()
        dt = np.zeros(len(series.times), dtype=np.float64)
        if len(dt) > 1:
            dt[1:] = np.maximum(np.diff(series.times), 0.0)
        return np.column_stack(
            [
                series.values.astype(np.float64),
                series.errors.astype(np.float64),
                np.log1p(dt),
            ]
        )

    @staticmethod
    def _fit_from_training_rows(
        continuous: np.ndarray,
        bands: tuple[str, ...],
        *,
        eps: float,
    ) -> "LightCurveFeaturizer":
        if continuous.ndim != 2 or continuous.shape[0] < 2 or continuous.shape[1] != 3:
            raise ValueError("training surface must contain at least two 3-feature observations")
        center = np.nanmedian(continuous, axis=0)
        mad = np.nanmedian(np.abs(continuous - center), axis=0)
        scale = 1.4826 * mad
        fallback = np.nanstd(continuous, axis=0)
        scale = np.where(scale > eps, scale, np.where(fallback > eps, fallback, 1.0))
        if not bands:
            raise ValueError("training surface has no passbands")
        return LightCurveFeaturizer(
            center=center.astype(np.float32),
            scale=scale.astype(np.float32),
            bands=tuple(sorted(set(bands))),
        )

    @classmethod
    def fit(cls, series: LightCurveSeries, train_end: int, eps: float = 1e-6) -> "LightCurveFeaturizer":
        series.validate()
        if not 2 <= train_end <= len(series.times):
            raise ValueError("train_end must include at least two observations and stay within series")
        continuous = cls._continuous(series)[:train_end]
        bands = tuple(str(b) for b in series.bands[:train_end])
        return cls._fit_from_training_rows(continuous, bands, eps=eps)

    @classmethod
    def fit_many(
        cls,
        series: list[LightCurveSeries] | tuple[LightCurveSeries, ...],
        *,
        eps: float = 1e-6,
    ) -> "LightCurveFeaturizer":
        """Fit one astronomy featurizer from complete *training objects only*.

        This is the object-level counterpart to :meth:`fit`. It intentionally accepts no
        validation/test objects and performs no concatenation before delta-time construction:
        the first event of every object receives delta-time zero, so an artificial time gap
        between unrelated light curves can never enter the scaler.
        """
        if not series:
            raise ValueError("at least one training light curve is required")
        continuous_parts: list[np.ndarray] = []
        training_bands: list[str] = []
        for light_curve in series:
            light_curve.validate()
            continuous_parts.append(cls._continuous(light_curve))
            training_bands.extend(str(b) for b in light_curve.bands)
        continuous = np.concatenate(continuous_parts, axis=0)
        return cls._fit_from_training_rows(
            continuous,
            tuple(training_bands),
            eps=eps,
        )

    def transform(self, series: LightCurveSeries, *, include_time: bool = True) -> np.ndarray:
        continuous = self._continuous(series)
        scaled = np.nan_to_num(
            (continuous - self.center) / self.scale,
            nan=0.0,
            posinf=0.0,
            neginf=0.0,
        ).astype(np.float32)
        if not include_time:
            scaled[:, 2] = 0.0

        band_to_index = {band: i for i, band in enumerate(self.bands)}
        one_hot = np.zeros((len(series.times), len(self.bands) + 1), dtype=np.float32)
        unk = len(self.bands)
        for row, band in enumerate(series.bands):
            one_hot[row, band_to_index.get(str(band), unk)] = 1.0
        return np.concatenate([scaled, one_hot], axis=1)

    @property
    def n_features(self) -> int:
        return 3 + len(self.bands) + 1


def load_lightcurve_csv(
    path: str | Path,
    *,
    time_column: str = "mjd",
    value_column: str = "mag",
    error_column: str = "magerr",
    band_column: str = "band",
    label_column: str | None = None,
) -> LightCurveSeries:
    """Load and chronologically sort a flat multi-band light-curve CSV."""
    path = Path(path)
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        if not reader.fieldnames:
            raise ValueError("CSV has no header")
        required = {time_column, value_column, error_column, band_column}
        missing = required - set(reader.fieldnames)
        if missing:
            raise ValueError(f"missing light-curve columns: {sorted(missing)}")
        if label_column is not None and label_column not in reader.fieldnames:
            raise ValueError(f"label column {label_column!r} not found")
        rows = list(reader)
    if not rows:
        raise ValueError("CSV has no observations")

    parsed: list[tuple[float, float, float, str, int | None]] = []
    for row in rows:
        label = int(float(row[label_column])) if label_column is not None else None
        if label is not None and label not in (0, 1):
            raise ValueError("labels must be binary 0/1")
        parsed.append(
            (
                float(row[time_column]),
                float(row[value_column]),
                float(row[error_column]),
                str(row[band_column]),
                label,
            )
        )
    parsed.sort(key=lambda row: row[0])
    labels = None
    if label_column is not None:
        labels = np.asarray([row[4] for row in parsed], dtype=np.int64)
    return LightCurveSeries(
        times=np.asarray([row[0] for row in parsed], dtype=np.float64),
        values=np.asarray([row[1] for row in parsed], dtype=np.float32),
        errors=np.asarray([row[2] for row in parsed], dtype=np.float32),
        bands=np.asarray([row[3] for row in parsed], dtype=object),
        labels=labels,
    ).validate()
