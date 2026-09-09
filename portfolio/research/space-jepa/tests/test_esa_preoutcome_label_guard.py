from __future__ import annotations

import ast
import importlib.util
from pathlib import Path

import numpy as np
import pandas as pd
import pytest


RUNNER_PATH = Path(__file__).parents[1] / "run_esa_adb.py"


def load_runner():
    spec = importlib.util.spec_from_file_location("space_jepa_run_esa_label_guard", RUNNER_PATH)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_test_telemetry_loader_does_not_materialize_annotation_values(tmp_path):
    module = load_runner()
    path = tmp_path / "esa-test.csv"
    path.write_text(
        "timestamp,channel_41,is_anomaly_channel_41,channel_42,is_anomaly_channel_42\n"
        "2007-01-01 00:00:00,1.0,DO_NOT_MATERIALIZE,5.0,ALSO_DO_NOT_MATERIALIZE\n"
        "2007-01-01 00:00:30,2.0,NOT_A_NUMBER,6.0,NOT_A_NUMBER\n",
        encoding="utf-8",
    )

    telemetry, timestamps = module.load_test_telemetry_only(
        path, ("channel_41", "channel_42")
    )

    np.testing.assert_array_equal(
        telemetry,
        np.array([[1.0, 5.0], [2.0, 6.0]], dtype=np.float32),
    )
    assert timestamps.tolist() == [
        "2007-01-01 00:00:00",
        "2007-01-01 00:00:30",
    ]


def test_global_runner_only_uses_label_aware_loader_for_training_input():
    tree = ast.parse(RUNNER_PATH.read_text(encoding="utf-8"))
    calls = [
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Name)
        and node.func.id == "load_esa_adb_csv"
    ]
    assert len(calls) == 1
    assert calls[0].args
    first_arg = calls[0].args[0]
    assert isinstance(first_arg, ast.Attribute)
    assert isinstance(first_arg.value, ast.Name)
    assert first_arg.value.id == "args"
    assert first_arg.attr == "train_csv"


def test_global_runner_never_hashes_label_bearing_test_file():
    tree = ast.parse(RUNNER_PATH.read_text(encoding="utf-8"))
    calls = [
        node
        for node in ast.walk(tree)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Name)
        and node.func.id == "sha256"
    ]
    for call in calls:
        assert call.args
        first_arg = call.args[0]
        assert not (
            isinstance(first_arg, ast.Attribute)
            and isinstance(first_arg.value, ast.Name)
            and first_arg.value.id == "args"
            and first_arg.attr == "test_csv"
        )


def test_runner_receipt_does_not_claim_zero_test_source_access():
    source = RUNNER_PATH.read_text(encoding="utf-8")
    assert '"heldout_label_access"' not in source
    assert '"test_annotation_columns_loaded"' not in source
    assert '"test_source_contains_interleaved_annotations": True' in source
    assert '"test_annotation_values_materialized": False' in source
    assert '"test_annotation_values_exposed_to_model": False' in source
    assert (
        '"test_source_io_scope": "INTERLEAVED_CSV_TOKENIZED_TELEMETRY_TIMESTAMP_PROJECTION_ONLY"'
        in source
    )
    assert (
        '"full_source_sha256_status": "NOT_COMPUTED_PRE_OUTCOME_TO_AVOID_FULL_FILE_BYTE_READ"'
        in source
    )


def test_label_blind_projection_digest_is_deterministic_and_channel_bound():
    module = load_runner()
    timestamps = np.array(["t0", "t1"], dtype=object)
    telemetry = np.array([[1.0, 5.0], [2.0, 6.0]], dtype=np.float32)
    channels = ("channel_41", "channel_42")

    digest = module.telemetry_projection_sha256(timestamps, telemetry, channels)
    assert digest == module.telemetry_projection_sha256(timestamps, telemetry, channels)
    assert digest != module.telemetry_projection_sha256(
        timestamps, telemetry, tuple(reversed(channels))
    )
    changed = telemetry.copy()
    changed[1, 1] = 7.0
    assert digest != module.telemetry_projection_sha256(timestamps, changed, channels)


def test_prediction_export_requires_score_timestamp_alignment(tmp_path):
    module = load_runner()
    output = tmp_path / "predictions.csv"
    timestamps = np.array(["t0", "t1"], dtype=object)
    scores = {"space_jepa": np.array([0.1], dtype=np.float64)}
    thresholds = {"space_jepa": 0.5}

    with pytest.raises(ValueError, match="score length does not match test timestamps"):
        module.write_prediction_csv(output, timestamps, scores, thresholds)


def test_prediction_export_contains_no_annotation_columns(tmp_path):
    module = load_runner()
    output = tmp_path / "predictions.csv"
    timestamps = np.array(["t0", "t1"], dtype=object)
    scores = {
        "space_jepa": np.array([0.1, 0.9], dtype=np.float64),
        "robust_zscore": np.array([0.2, 0.8], dtype=np.float64),
        "persistence": np.array([0.3, 0.7], dtype=np.float64),
    }
    thresholds = {"space_jepa": 0.5, "robust_zscore": 0.5, "persistence": 0.5}

    module.write_prediction_csv(output, timestamps, scores, thresholds)
    frame = pd.read_csv(output)

    assert frame.columns.tolist() == [
        "timestamp",
        "space_jepa_score",
        "space_jepa_pred",
        "robust_zscore_score",
        "robust_zscore_pred",
        "persistence_score",
        "persistence_pred",
    ]
    assert not any(column.startswith("is_anomaly_") for column in frame.columns)
