from pathlib import Path
from types import SimpleNamespace
import hashlib
import importlib.util

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


def _load_probe_runner():
    path = Path(__file__).parents[1] / "run_esa_channel_probe.py"
    spec = importlib.util.spec_from_file_location("space_jepa_channel_probe_runner", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


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


def test_probe_runner_freezes_constants_and_verifies_source_bytes(tmp_path):
    module = _load_probe_runner()
    assert module.RIDGE_ALPHA == 1.0
    assert module.FIT_STRIDE == 4
    assert module.SCORE_STRIDE == 1
    assert module.BATCH_SIZE == 128

    train = tmp_path / "train.csv"
    test = tmp_path / "test.csv"
    train.write_bytes(b"train-bytes")
    test.write_bytes(b"test-bytes")
    run = {
        "train": {"sha256": hashlib.sha256(train.read_bytes()).hexdigest()},
        "test": {"sha256": hashlib.sha256(test.read_bytes()).hexdigest()},
        "source_contract": {"channels": ["channel_41", "channel_42"]},
    }
    module._verify_source_bytes(run, train, test)
    assert module._source_channels(run) == ("channel_41", "channel_42")

    run["test"]["sha256"] = "0" * 64
    try:
        module._verify_source_bytes(run, train, test)
    except ValueError as exc:
        assert "test CSV bytes" in str(exc)
    else:
        raise AssertionError("mismatched source bytes must fail closed")


def test_telemetry_only_reader_does_not_parse_annotation_columns(tmp_path):
    module = _load_probe_runner()
    path = tmp_path / "esa.csv"
    path.write_text(
        "timestamp,channel_41,is_anomaly_channel_41,channel_42,is_anomaly_channel_42\n"
        "t0,1.5,THIS_IS_NOT_A_NUMERIC_LABEL,2.5,ALSO_NOT_NUMERIC\n"
        "t1,3.5,UNREADABLE,4.5,UNREADABLE\n",
        encoding="utf-8",
    )
    telemetry, timestamps = module._load_telemetry_only(
        path, ("channel_41", "channel_42"), load_timestamps=True
    )
    np.testing.assert_allclose(telemetry, [[1.5, 2.5], [3.5, 4.5]])
    assert timestamps is not None
    assert timestamps.tolist() == ["t0", "t1"]


def test_source_channel_identity_rejects_duplicates():
    module = _load_probe_runner()
    run = {"source_contract": {"channels": ["channel_41", "channel_41"]}}
    try:
        module._source_channels(run)
    except ValueError as exc:
        assert "duplicate" in str(exc)
    else:
        raise AssertionError("duplicate channel identity must fail closed")
