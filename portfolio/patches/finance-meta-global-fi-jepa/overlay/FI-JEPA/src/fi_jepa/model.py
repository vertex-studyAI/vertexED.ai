from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from numpy.typing import NDArray

FloatArray = NDArray[np.float64]


@dataclass(frozen=True)
class ProbeMetrics:
    mse: float
    directional_accuracy: float
    persistence_mse: float


class FIJEPA:
    """Small NumPy JEPA baseline for chronological multivariate windows."""

    def __init__(
        self,
        *,
        features: int,
        target_length: int,
        embedding_dim: int = 12,
        learning_rate: float = 0.03,
        ema_momentum: float = 0.98,
        seed: int = 7,
    ) -> None:
        if features < 1 or target_length < 1 or embedding_dim < 2:
            raise ValueError("invalid model dimensions")
        if not 0.0 < learning_rate <= 0.2:
            raise ValueError("learning_rate must be in (0, 0.2]")
        if not 0.0 <= ema_momentum < 1.0:
            raise ValueError("ema_momentum must be in [0, 1)")

        rng = np.random.default_rng(seed)
        scale = 1.0 / np.sqrt(features)
        self.context_encoder = rng.normal(0.0, scale, size=(features, embedding_dim))
        self.target_encoder = self.context_encoder.copy()
        self.predictor = rng.normal(
            0.0,
            1.0 / np.sqrt(embedding_dim),
            size=(embedding_dim, target_length * embedding_dim),
        )
        self.target_length = target_length
        self.learning_rate = learning_rate
        self.ema_momentum = ema_momentum

    def encode(self, contexts: FloatArray) -> FloatArray:
        values = np.asarray(contexts, dtype=np.float64)
        if values.ndim != 3 or values.shape[2] != self.context_encoder.shape[0]:
            raise ValueError("contexts must have shape [batch, time, features]")
        return values.mean(axis=1) @ self.context_encoder

    def loss(self, contexts: FloatArray, targets: FloatArray) -> float:
        target_values = self._validate_targets(targets)
        predicted = self.encode(contexts) @ self.predictor
        encoded_target = (target_values @ self.target_encoder).reshape(predicted.shape)
        return float(np.mean(np.square(predicted - encoded_target)))

    def fit(self, contexts: FloatArray, targets: FloatArray, *, epochs: int = 40) -> list[float]:
        if epochs < 1:
            raise ValueError("epochs must be positive")
        x = np.asarray(contexts, dtype=np.float64)
        y = self._validate_targets(targets)
        if x.ndim != 3 or x.shape[0] != y.shape[0]:
            raise ValueError("context and target batches must align")

        mean_context = x.mean(axis=1)
        history: list[float] = []

        for _ in range(epochs):
            context_embedding = mean_context @ self.context_encoder
            target_embedding = (y @ self.target_encoder).reshape(x.shape[0], -1)
            prediction = context_embedding @ self.predictor
            error = prediction - target_embedding
            history.append(float(np.mean(np.square(error))))

            grad_prediction = (2.0 / error.size) * error
            grad_predictor = context_embedding.T @ grad_prediction
            grad_context_embedding = grad_prediction @ self.predictor.T
            grad_context_encoder = mean_context.T @ grad_context_embedding

            predictor_norm = max(1.0, float(np.linalg.norm(grad_predictor)) / 5.0)
            encoder_norm = max(1.0, float(np.linalg.norm(grad_context_encoder)) / 5.0)
            self.predictor -= self.learning_rate * grad_predictor / predictor_norm
            self.context_encoder -= self.learning_rate * grad_context_encoder / encoder_norm
            self.target_encoder = (
                self.ema_momentum * self.target_encoder
                + (1.0 - self.ema_momentum) * self.context_encoder
            )

        return history

    def _validate_targets(self, targets: FloatArray) -> FloatArray:
        values = np.asarray(targets, dtype=np.float64)
        if (
            values.ndim != 3
            or values.shape[1] != self.target_length
            or values.shape[2] != self.target_encoder.shape[0]
        ):
            raise ValueError("targets have incompatible shape")
        return values


def fit_ridge_probe(
    model: FIJEPA,
    train_context: FloatArray,
    train_target: FloatArray,
    validation_context: FloatArray,
    validation_target: FloatArray,
    *,
    ridge: float = 1e-2,
) -> ProbeMetrics:
    """Fit a frozen linear probe for mean next-window return of feature zero."""
    if ridge <= 0:
        raise ValueError("ridge must be positive")

    train_x = model.encode(train_context)
    validation_x = model.encode(validation_context)
    train_y = np.asarray(train_target, dtype=np.float64)[:, :, 0].mean(axis=1)
    validation_y = np.asarray(validation_target, dtype=np.float64)[:, :, 0].mean(axis=1)

    train_design = np.column_stack([np.ones(train_x.shape[0]), train_x])
    validation_design = np.column_stack([np.ones(validation_x.shape[0]), validation_x])
    penalty = ridge * np.eye(train_design.shape[1])
    penalty[0, 0] = 0.0
    weights = np.linalg.solve(train_design.T @ train_design + penalty, train_design.T @ train_y)
    predictions = validation_design @ weights

    persistence = validation_context[:, -1, 0]
    return ProbeMetrics(
        mse=float(np.mean(np.square(predictions - validation_y))),
        directional_accuracy=float(np.mean(np.sign(predictions) == np.sign(validation_y))),
        persistence_mse=float(np.mean(np.square(persistence - validation_y))),
    )
