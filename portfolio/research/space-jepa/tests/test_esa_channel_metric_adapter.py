from pathlib import Path
import hashlib
import importlib.util
import json

import numpy as np
import pandas as pd


def _load_adapter():
    path = Path(__file__).parents[1] / "evaluate_esa_channel_fscore.py"
    spec = importlib.util.spec_from_file_location("space_jepa_channel_metric_adapter", path)
    assert spec is not None and spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_git_blob_identity_matches_git_object_definition(tmp_path):
    module = _load_adapter()
    path = tmp_path / "source.py"
    content = b"print('frozen')\n"
    path.write_bytes(content)
    expected = hashlib.sha1(f"blob {len(content)}\0".encode("ascii") + content).hexdigest()
    assert module.git_blob_sha1(path) == expected


def test_channel_receipt_and_surface_are_exact_hash_and_order_bound(tmp_path):
    module = _load_adapter()
    channels = ["channel_41", "channel_42"]
    artifacts = {}
    for method in module.METHODS:
        path = tmp_path / f"{method}.csv"
        pd.DataFrame(
            {
                "timestamp": ["2000-01-01", "2000-01-02"],
                "channel_41_score": [0.1, 1.1],
                "channel_41_pred": [0, 1],
                "channel_42_score": [0.2, 1.2],
                "channel_42_pred": [0, 1],
            }
        ).to_csv(path, index=False)
        artifacts[method] = {"path": path.name, "sha256": module.sha256(path)}
    receipt_path = tmp_path / "channel_probe.json"
    receipt_path.write_text(
        json.dumps(
            {
                "status": "PRE_OUTCOME_MATCHED_CHANNEL_SURFACES_NOT_OFFICIAL_RESULT",
                "annotation_columns_loaded": False,
                "anomaly_label_access": False,
                "channels": channels,
                "artifacts": artifacts,
            }
        ),
        encoding="utf-8",
    )
    receipt = module.load_receipt(receipt_path)
    timestamps, loaded_channels, preds = module.load_method_surface(
        receipt_path, receipt, "space_jepa"
    )
    assert loaded_channels == tuple(channels)
    assert timestamps.is_monotonic_increasing
    np.testing.assert_array_equal(preds, [[0, 0], [1, 1]])

    # Any byte drift after the receipt was frozen must fail closed.
    with (tmp_path / "space_jepa.csv").open("a", encoding="utf-8") as fh:
        fh.write("\n")
    try:
        module.load_method_surface(receipt_path, receipt, "space_jepa")
    except ValueError as exc:
        assert "SHA-256 mismatch" in str(exc)
    else:
        raise AssertionError("surface byte drift must fail closed")


def test_adapter_requires_predeclared_benchmark_metadata_hash(tmp_path):
    module = _load_adapter()
    path = tmp_path / "labels.csv"
    path.write_bytes(b"immutable-label-bytes")
    expected = module.sha256(path)
    assert module.verify_expected_sha256(path, expected, "labels.csv") == expected
    try:
        module.verify_expected_sha256(path, "0" * 64, "labels.csv")
    except ValueError as exc:
        assert "SHA-256 mismatch" in str(exc)
    else:
        raise AssertionError("benchmark metadata drift must fail closed")


def test_ground_truth_filter_and_prediction_dictionary_are_channel_aligned(tmp_path):
    module = _load_adapter()
    labels = tmp_path / "labels.csv"
    types = tmp_path / "anomaly_types.csv"
    channels_csv = tmp_path / "channels.csv"
    labels.write_text(
        "ID,Channel,StartTime,EndTime\n"
        "A1,channel_41,2000-01-02,2000-01-03\n"
        "A1,channel_42,2000-01-02,2000-01-03\n"
        "A2,channel_99,2000-01-02,2000-01-03\n",
        encoding="utf-8",
    )
    types.write_text(
        "ID,Category,Dimensionality,Locality,Length\n"
        "A1,Anomaly,Multivariate,Local,Short\n"
        "A2,Rare Event,Univariate,Local,Short\n",
        encoding="utf-8",
    )
    channels_csv.write_text(
        "Channel,Subsystem\nchannel_41,S1\nchannel_42,S1\nchannel_99,S2\n",
        encoding="utf-8",
    )
    timestamps = pd.DatetimeIndex(pd.to_datetime(["2000-01-01", "2000-01-02", "2000-01-03"]))
    frozen_channels = ("channel_41", "channel_42")
    ground_truth, subsystems = module.load_ground_truth(
        labels, types, channels_csv, frozen_channels, timestamps
    )
    assert set(ground_truth["Channel"]) == set(frozen_channels)
    assert subsystems == {"S1": ["channel_41", "channel_42"]}

    predictions = module.prediction_dict(
        timestamps,
        frozen_channels,
        np.array([[0, 1], [1, 0], [0, 0]], dtype=np.uint8),
    )
    assert set(predictions) == set(frozen_channels)
    assert predictions["channel_41"].shape == (3, 2)
    assert predictions["channel_41"][:, 1].tolist() == [0, 1, 0]
