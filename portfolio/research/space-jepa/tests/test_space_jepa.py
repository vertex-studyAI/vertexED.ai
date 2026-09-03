from pathlib import Path
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
    assert auroc(y, scores) == 0.875


def test_event_metric_is_one_to_one():
    from space_jepa.metrics import event_f1

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


def test_lightcurve_featurizer_is_train_fit_and_handles_unknown_band():
    from space_jepa.astro import LightCurveFeaturizer, LightCurveSeries

    series = LightCurveSeries(
        times=np.array([1.0, 2.0, 4.0, 8.0, 16.0]),
        values=np.array([20.0, 20.1, 20.2, 20.3, 99.0], dtype=np.float32),
        errors=np.array([0.1, 0.1, 0.2, 0.2, 9.0], dtype=np.float32),
        bands=np.array(["g", "r", "g", "r", "i"], dtype=object),
    )
    featurizer = LightCurveFeaturizer.fit(series, train_end=4)
    x = featurizer.transform(series)
    x_no_time = featurizer.transform(series, include_time=False)
    assert featurizer.bands == ("g", "r")
    assert featurizer.n_features == 6
    assert x.shape == (5, 6)
    assert x[-1, -1] == 1.0
    assert np.all(x_no_time[:, 2] == 0.0)
    assert featurizer.center[0] < 21.0


def test_lightcurve_csv_is_sorted_chronologically(tmp_path):
    from space_jepa.astro import load_lightcurve_csv

    path = tmp_path / "lc.csv"
    path.write_text(
        "mjd,mag,magerr,band,label\n"
        "3,19.8,0.2,r,1\n"
        "1,20.1,0.1,g,0\n"
        "2,20.0,0.1,g,0\n",
        encoding="utf-8",
    )
    series = load_lightcurve_csv(path, label_column="label")
    assert series.times.tolist() == [1.0, 2.0, 3.0]
    assert series.labels.tolist() == [0, 0, 1]


def test_lazy_window_dataset_matches_materialized_windows():
    from space_jepa.training import TelemetryWindowDataset

    x = np.arange(72, dtype=np.float32).reshape(24, 3)
    materialized = make_windows(x, 5, 3, stride=2)
    lazy = TelemetryWindowDataset(x, 5, 3, stride=2)
    assert len(lazy) == len(materialized.starts)
    contexts = []
    targets = []
    starts = []
    for i in range(len(lazy)):
        context, target, start = lazy[i]
        contexts.append(context.numpy())
        targets.append(target.numpy())
        starts.append(start)
    np.testing.assert_array_equal(np.stack(contexts), materialized.context)
    np.testing.assert_array_equal(np.stack(targets), materialized.target)
    assert starts == materialized.starts.tolist()


def test_official_esa_adb_adapter_excludes_annotation_columns(tmp_path):
    from space_jepa.esa_adb import load_esa_adb_csv

    path = tmp_path / "esa.csv"
    path.write_text(
        "timestamp,channel_41,channel_42,is_anomaly_channel_41,is_anomaly_channel_42\n"
        "2007-01-01 00:00:00,1.0,5.0,0,0\n"
        "2007-01-01 00:00:30,2.0,6.0,1,0\n"
        "2007-01-01 00:01:00,3.0,7.0,0,2\n"
        "2007-01-01 00:01:30,4.0,8.0,3,0\n",
        encoding="utf-8",
    )
    table = load_esa_adb_csv(path, channels=("channel_41", "channel_42"))
    assert table.feature_names == ("channel_41", "channel_42")
    assert table.telemetry.shape == (4, 2)
    assert table.channel_labels.shape == (4, 2)
    np.testing.assert_array_equal(table.telemetry[:, 0], [1.0, 2.0, 3.0, 4.0])
    assert table.binary_labels(include_rare_events=False).tolist() == [0, 1, 0, 0]
    assert table.binary_labels(include_rare_events=True).tolist() == [0, 1, 1, 0]
    assert table.diagnostic_valid_mask().tolist() == [True, True, True, False]


def test_esa_adb_official_lite_presets_match_benchmark_scripts():
    from space_jepa.esa_adb import MISSION1_LITE_CHANNELS, MISSION2_LITE_CHANNELS

    assert MISSION1_LITE_CHANNELS == tuple(f"channel_{i}" for i in range(41, 47))
    assert MISSION2_LITE_CHANNELS == tuple(f"channel_{i}" for i in range(18, 29))


def test_esa_test_warm_start_uses_only_training_tail():
    import importlib.util

    path = Path(__file__).parents[1] / "run_esa_adb.py"
    spec = importlib.util.spec_from_file_location("space_jepa_run_esa", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    train = np.arange(20, dtype=np.float32).reshape(10, 2)
    test = np.arange(8, dtype=np.float32).reshape(4, 2) + 100
    warmed = module.warm_start_test(train, test, context_length=3)
    np.testing.assert_array_equal(warmed[:3], train[-3:])
    np.testing.assert_array_equal(warmed[3:], test)


def test_official_ground_truth_merge_and_clip(tmp_path):
    import importlib.util
    import pandas as pd

    labels = tmp_path / "labels.csv"
    types = tmp_path / "anomaly_types.csv"
    labels.write_text(
        "ID,Channel,StartTime,EndTime\n"
        "a1,channel_41,2006-12-31 23:59:30,2007-01-01 00:00:30\n"
        "a2,channel_42,2007-01-01 00:02:00,2007-01-01 00:03:00\n",
        encoding="utf-8",
    )
    types.write_text(
        "ID,Category,Dimensionality,Locality,Length\n"
        "a1,Anomaly,Univariate,Local,Subsequence\n"
        "a2,Rare Event,Univariate,Local,Subsequence\n",
        encoding="utf-8",
    )
    path = Path(__file__).parents[1] / "evaluate_esa_adb.py"
    spec = importlib.util.spec_from_file_location("space_jepa_eval_esa", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    start = pd.Timestamp("2007-01-01 00:00:00")
    end = pd.Timestamp("2007-01-01 00:02:30")
    ground_truth = module.prepare_ground_truth(labels, types, start, end)
    assert set(ground_truth["Category"]) == {"Anomaly", "Rare Event"}
    assert ground_truth["StartTime"].min() == start
    assert ground_truth["EndTime"].max() == end


def test_threshold_training_score_selection_cannot_consume_labels():
    import importlib.util
    import inspect

    run_csv_path = Path(__file__).parents[1] / "run_csv.py"
    spec = importlib.util.spec_from_file_location("space_jepa_run_csv", run_csv_path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    signature = inspect.signature(module.valid_train_scores)
    assert tuple(signature.parameters) == ("scores", "coverage", "train_end")
    scores = np.array([0.1, 9.0, 0.2, 100.0], dtype=np.float64)
    coverage = np.array([1, 1, 1, 1], dtype=np.int64)
    selected = module.valid_train_scores(scores, coverage, train_end=3)
    assert selected.tolist() == [0.1, 9.0, 0.2]
