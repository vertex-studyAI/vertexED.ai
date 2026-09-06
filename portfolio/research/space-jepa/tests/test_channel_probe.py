from types import SimpleNamespace

import numpy as np
import torch

from space_jepa.channel_probe import RidgeChannelProbe, fit_channel_probe, score_channel_errors


class LinearFutureModel(torch.nn.Module):
    """Deterministic fixture used only to exercise probe fitting mechanics."""

    def __init__(self, n_features: int, context_length: int = 3, target_length: int = 1):
        super().__init__()
        self.cfg = SimpleNamespace(
            n_features=n_features,
            context_length=context_length,
            target_length=target_length,
        )

    def latent_pairs(self, context: torch.Tensor, target: torch.Tensor):
        predicted = target.clone()
        return predicted, predicted.detach()


def test_probe_recovers_identity_decoder_and_alignment():
    rng = np.random.default_rng(7)
    x = rng.normal(size=(24, 2)).astype(np.float32)
    model = LinearFutureModel(2)
    probe = fit_channel_probe(model, x[:18], ridge_alpha=1e-8, stride=1, batch_size=4)
    assert probe.weights.shape == (2, 2)
    assert probe.bias.shape == (2,)
    np.testing.assert_allclose(probe.weights, np.eye(2), rtol=1e-5, atol=1e-5)
    np.testing.assert_allclose(probe.bias, [0.0, 0.0], rtol=1e-5, atol=1e-5)

    scores, counts = score_channel_errors(model, probe, x, stride=1, batch_size=5)
    assert scores.shape == x.shape
    assert counts.shape == (len(x),)
    assert np.isnan(scores[:3]).all()
    assert np.all(counts[3:] == 1)
    assert float(np.nanmax(scores)) < 1e-8


def test_probe_is_train_only_and_does_not_accept_labels():
    model = LinearFutureModel(1, context_length=2, target_length=1)
    train = np.arange(12, dtype=np.float32).reshape(-1, 1)
    probe = fit_channel_probe(model, train, ridge_alpha=1.0)
    assert isinstance(probe, RidgeChannelProbe)
    import inspect

    assert "labels" not in inspect.signature(fit_channel_probe).parameters
    assert "y" not in inspect.signature(fit_channel_probe).parameters


def test_probe_rejects_nonfinite_telemetry_and_channel_mismatch():
    model = LinearFutureModel(2)
    x = np.arange(40, dtype=np.float32).reshape(20, 2)
    probe = fit_channel_probe(model, x, ridge_alpha=1.0)
    bad = x.copy()
    bad[5, 0] = np.nan
    try:
        fit_channel_probe(model, bad, ridge_alpha=1.0)
    except ValueError as exc:
        assert "finite" in str(exc)
    else:
        raise AssertionError("nonfinite telemetry must fail closed")

    one_channel = np.arange(20, dtype=np.float32).reshape(-1, 1)
    try:
        score_channel_errors(model, probe, one_channel)
    except ValueError as exc:
        assert "channels" in str(exc)
    else:
        raise AssertionError("channel mismatch must fail closed")


def test_probe_serialization_records_predeclared_ridge_strength():
    probe = RidgeChannelProbe(
        weights=np.eye(2, dtype=np.float64),
        bias=np.zeros(2, dtype=np.float64),
        ridge_alpha=0.25,
    )
    payload = probe.to_dict()
    assert payload["probe_type"] == "train_only_ridge_decoder"
    assert payload["ridge_alpha"] == 0.25
    assert payload["latent_dim"] == 2
    assert payload["n_channels"] == 2
