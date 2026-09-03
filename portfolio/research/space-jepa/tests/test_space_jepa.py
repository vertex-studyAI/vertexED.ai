import numpy as np
import torch

from space_jepa.config import SpaceJEPAConfig
from space_jepa.data import RobustScaler, make_windows, synthetic_telemetry
from space_jepa.metrics import event_f1, threshold_from_nominal
from space_jepa.model import SpaceJEPA


def test_scaler_is_train_only_and_finite():
    train = np.array([[0.0, 1.0], [1.0, 2.0], [2.0, 3.0]], dtype=np.float32)
    test = np.array([[1000.0, 4.0]], dtype=np.float32)
    scaler = RobustScaler.fit(train)
    transformed = scaler.transform(test)
    assert transformed.shape == test.shape
    assert np.isfinite(transformed).all()
    assert scaler.center[0] == 1.0


def test_windows_align_target_labels():
    x = np.arange(40, dtype=np.float32).reshape(20, 2)
    y = np.zeros(20, dtype=np.int64)
    y[7] = 1
    w = make_windows(x, 5, 3, stride=2, labels=y)
    assert w.context.shape[1:] == (5, 2)
    assert w.target.shape[1:] == (3, 2)
    assert w.target_labels[0].tolist() == y[5:8].tolist()


def test_model_shapes_and_frozen_target():
    cfg = SpaceJEPAConfig(n_features=4, context_length=12, target_length=4, d_model=32, n_heads=4, n_layers=1, predictor_layers=1, dropout=0.0)
    model = SpaceJEPA(cfg)
    context = torch.randn(3, 12, 4)
    target = torch.randn(3, 4, 4)
    predicted, target_z = model.latent_pairs(context, target)
    assert predicted.shape == target_z.shape == (3, 4, 32)
    assert all(not p.requires_grad for p in model.target_encoder.parameters())
    loss, metrics = model.loss(context, target)
    assert torch.isfinite(loss)
    assert metrics["loss"] >= 0.0


def test_ema_target_moves_without_grad():
    cfg = SpaceJEPAConfig(n_features=2, context_length=8, target_length=2, d_model=16, n_heads=4, n_layers=1, predictor_layers=1, dropout=0.0, ema_decay=0.5)
    model = SpaceJEPA(cfg)
    before = [p.detach().clone() for p in model.target_encoder.parameters()]
    with torch.no_grad():
        next(model.encoder.parameters()).add_(1.0)
    model.update_target_encoder()
    after = list(model.target_encoder.parameters())
    assert any(not torch.equal(a, b) for a, b in zip(before, after, strict=True))


def test_threshold_and_event_metric():
    threshold = threshold_from_nominal(np.array([0.1, 0.2, 0.3, 0.4]), 0.75)
    y = np.array([0, 1, 1, 0, 0, 1, 1, 0])
    scores = np.array([0.0, 0.8, 0.7, 0.1, 0.1, 0.9, 0.8, 0.0])
    metrics = event_f1(y, scores, 0.5)
    assert 0.2 < threshold < 0.4
    assert metrics["event_f1"] == 1.0


def test_synthetic_fixture_keeps_training_prefix_nominal():
    _, y = synthetic_telemetry(n_steps=600, anomaly_start=400)
    assert y[:400].sum() == 0
    assert y[400:].sum() > 0


def test_auroc_handles_ties_without_pairwise_matrix():
    from space_jepa.metrics import auroc

    y = np.array([0, 1, 0, 1], dtype=np.int64)
    scores = np.array([0.1, 0.5, 0.5, 0.9], dtype=np.float64)
    # Positive scores: .5, .9. Negative scores: .1, .5 -> 3 wins + 1 tie over 4 pairs.
    assert auroc(y, scores) == 0.875


def test_event_metric_is_one_to_one():
    from space_jepa.metrics import event_f1

    # One broad predicted event overlaps two true events but may match only one.
    y = np.array([0, 1, 1, 0, 1, 1, 0], dtype=np.int64)
    scores = np.array([0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0])
    metrics = event_f1(y, scores, 0.5)
    assert metrics["event_recall"] == 0.5
    assert metrics["pred_events"] == 1.0


def test_csv_adapter_checks_all_rows_and_keeps_blank_numeric(tmp_path):
    from space_jepa.data import load_csv

    path = tmp_path / "telemetry.csv"
    path.write_text(
        "timestamp,a,b,label\n"
        "t0,1,,0\n"
        "t1,2,3,1\n",
        encoding="utf-8",
    )
    x, y, columns = load_csv(path)
    assert columns == ["a", "b"]
    assert x.shape == (2, 2)
    assert np.isnan(x[0, 1])
    assert y.tolist() == [0, 1]
