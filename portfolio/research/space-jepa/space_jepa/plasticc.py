from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import csv

import numpy as np

from .astro import LightCurveSeries


PLASTICC_LIGHTCURVE_COLUMNS = {
    "object_id",
    "mjd",
    "passband",
    "flux",
    "flux_err",
    "detected",
}


@dataclass(frozen=True)
class PlasticcObject:
    object_id: int
    light_curve: LightCurveSeries


@dataclass(frozen=True)
class PlasticcLinearReadout:
    """Deterministic train-only affine softmax readout for frozen object embeddings.

    The fitting rule is intentionally simple and fully deterministic: standardize using the
    development-fitting embeddings only, optimize a single affine softmax layer with full-batch
    gradient descent for a fixed number of steps, use class-balanced sample weights, and apply L2
    regularization to weights but not the bias. No held-out object or held-out label is accepted by
    ``fit``.
    """

    classes: np.ndarray
    mean: np.ndarray
    scale: np.ndarray
    weights: np.ndarray
    bias: np.ndarray
    learning_rate: float
    l2: float
    steps: int

    @classmethod
    def fit(
        cls,
        embeddings: np.ndarray,
        labels: np.ndarray,
        *,
        learning_rate: float = 0.1,
        l2: float = 1e-4,
        steps: int = 2000,
    ) -> "PlasticcLinearReadout":
        x = np.asarray(embeddings, dtype=np.float64)
        y = np.asarray(labels)
        if x.ndim != 2 or x.shape[0] < 2 or x.shape[1] < 1:
            raise ValueError("embeddings must be a non-empty 2D matrix with at least two rows")
        if y.ndim != 1 or y.shape[0] != x.shape[0]:
            raise ValueError("labels must be a 1D vector aligned with embeddings")
        if not np.all(np.isfinite(x)):
            raise ValueError("embeddings must be finite")
        if learning_rate <= 0.0 or not np.isfinite(learning_rate):
            raise ValueError("learning_rate must be positive and finite")
        if l2 < 0.0 or not np.isfinite(l2):
            raise ValueError("l2 must be finite and non-negative")
        if steps <= 0:
            raise ValueError("steps must be positive")

        classes, inverse = np.unique(y, return_inverse=True)
        if len(classes) < 2:
            raise ValueError("readout requires at least two development classes")
        counts = np.bincount(inverse, minlength=len(classes)).astype(np.float64)
        if np.any(counts < 2):
            raise ValueError("every development class must contain at least two objects")

        mean = x.mean(axis=0)
        scale = x.std(axis=0)
        scale = np.where(scale > 1e-12, scale, 1.0)
        z = (x - mean) / scale

        n_classes = len(classes)
        target = np.zeros((len(y), n_classes), dtype=np.float64)
        target[np.arange(len(y)), inverse] = 1.0
        sample_weight = 1.0 / (n_classes * counts[inverse])

        weights = np.zeros((x.shape[1], n_classes), dtype=np.float64)
        bias = np.zeros(n_classes, dtype=np.float64)
        for _ in range(steps):
            logits = z @ weights + bias
            logits -= logits.max(axis=1, keepdims=True)
            exp_logits = np.exp(logits)
            probabilities = exp_logits / exp_logits.sum(axis=1, keepdims=True)
            residual = (probabilities - target) * sample_weight[:, None]
            grad_w = z.T @ residual + l2 * weights
            grad_b = residual.sum(axis=0)
            weights -= learning_rate * grad_w
            bias -= learning_rate * grad_b

        if not np.all(np.isfinite(weights)) or not np.all(np.isfinite(bias)):
            raise ValueError("readout optimization produced non-finite parameters")
        return cls(
            classes=classes.copy(),
            mean=mean,
            scale=scale,
            weights=weights,
            bias=bias,
            learning_rate=float(learning_rate),
            l2=float(l2),
            steps=int(steps),
        )

    def predict_proba(self, embeddings: np.ndarray) -> np.ndarray:
        x = np.asarray(embeddings, dtype=np.float64)
        if x.ndim != 2 or x.shape[1] != self.weights.shape[0]:
            raise ValueError("prediction embeddings have the wrong feature dimension")
        if not np.all(np.isfinite(x)):
            raise ValueError("prediction embeddings must be finite")
        z = (x - self.mean) / self.scale
        logits = z @ self.weights + self.bias
        logits -= logits.max(axis=1, keepdims=True)
        exp_logits = np.exp(logits)
        probabilities = exp_logits / exp_logits.sum(axis=1, keepdims=True)
        if not np.all(np.isfinite(probabilities)):
            raise ValueError("readout produced non-finite probabilities")
        return probabilities

    def protocol_dict(self) -> dict[str, object]:
        return {
            "architecture": "single_affine_softmax_layer",
            "standardization": "development_fit_mean_and_population_std_only",
            "class_weighting": "equal_total_weight_per_development_class",
            "optimizer": "deterministic_full_batch_gradient_descent",
            "learning_rate": self.learning_rate,
            "l2_weight_penalty": self.l2,
            "bias_regularized": False,
            "steps": self.steps,
            "early_stopping": False,
            "heldout_input_to_fit_authorized": False,
        }


def load_plasticc_lightcurves_outcome_blind(path: str | Path) -> list[PlasticcObject]:
    """Load only the published PLAsTiCC light-curve feature surface.

    The parser requires the exact six feature columns used by the challenge light-curve files and
    rejects *every* extra column. This is deliberate: a future unblinded file containing target,
    class, label, score, or any other outcome-bearing column cannot be silently accepted. The
    returned objects contain no labels.
    """

    path = Path(path)
    with path.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        if not reader.fieldnames:
            raise ValueError("PLAsTiCC CSV has no header")
        observed = set(reader.fieldnames)
        if observed != PLASTICC_LIGHTCURVE_COLUMNS:
            missing = sorted(PLASTICC_LIGHTCURVE_COLUMNS - observed)
            extra = sorted(observed - PLASTICC_LIGHTCURVE_COLUMNS)
            raise ValueError(
                f"PLAsTiCC light-curve columns must match the frozen outcome-blind surface; "
                f"missing={missing}, extra={extra}"
            )
        rows = list(reader)
    if not rows:
        raise ValueError("PLAsTiCC light-curve CSV has no observations")

    grouped: dict[int, list[tuple[float, float, float, str]]] = {}
    for row in rows:
        object_id = int(row["object_id"])
        detected = int(row["detected"])
        if detected not in (0, 1):
            raise ValueError("detected must be binary 0/1")
        flux_err = float(row["flux_err"])
        if flux_err < 0.0 or not np.isfinite(flux_err):
            raise ValueError("flux_err must be finite and non-negative")
        mjd = float(row["mjd"])
        flux = float(row["flux"])
        if not np.isfinite(mjd) or not np.isfinite(flux):
            raise ValueError("mjd and flux must be finite")
        grouped.setdefault(object_id, []).append(
            (mjd, flux, flux_err, str(row["passband"]))
        )

    objects: list[PlasticcObject] = []
    for object_id in sorted(grouped):
        observations = sorted(grouped[object_id], key=lambda item: item[0])
        series = LightCurveSeries(
            times=np.asarray([item[0] for item in observations], dtype=np.float64),
            values=np.asarray([item[1] for item in observations], dtype=np.float32),
            errors=np.asarray([item[2] for item in observations], dtype=np.float32),
            bands=np.asarray([item[3] for item in observations], dtype=object),
            labels=None,
        ).validate()
        objects.append(PlasticcObject(object_id=object_id, light_curve=series))
    return objects
