from __future__ import annotations

import numpy as np
import pytest

from space_jepa.plasticc import (
    PLASTICC_LIGHTCURVE_COLUMNS,
    PLASTICC_OPEN_SET_CLASS_LABEL,
    PLASTICC_PRIMARY_CLASS_LABELS,
    PlasticcLinearReadout,
    load_plasticc_lightcurves_outcome_blind,
    plasticc_primary_seen_class_mask,
)


def _readout_fixture() -> tuple[np.ndarray, np.ndarray]:
    labels = np.repeat(np.asarray(PLASTICC_PRIMARY_CLASS_LABELS, dtype=np.int64), 2)
    # Deterministic separable object representations: each class occupies one coordinate.
    embeddings = np.zeros((len(labels), len(PLASTICC_PRIMARY_CLASS_LABELS)), dtype=np.float64)
    for class_index in range(len(PLASTICC_PRIMARY_CLASS_LABELS)):
        embeddings[2 * class_index : 2 * class_index + 2, class_index] = (2.0, 3.0)
    return embeddings, labels


def test_linear_readout_is_deterministic_train_only_and_probabilistic() -> None:
    x, y = _readout_fixture()
    first = PlasticcLinearReadout.fit(x, y)
    second = PlasticcLinearReadout.fit(x, y)
    np.testing.assert_array_equal(first.weights, second.weights)
    np.testing.assert_array_equal(first.bias, second.bias)
    np.testing.assert_array_equal(first.mean, x.mean(axis=0))
    np.testing.assert_array_equal(first.classes, np.asarray(PLASTICC_PRIMARY_CLASS_LABELS))

    probabilities = first.predict_proba(x)
    np.testing.assert_allclose(probabilities.sum(axis=1), 1.0, rtol=0.0, atol=1e-12)
    predicted = first.classes[np.argmax(probabilities, axis=1)]
    np.testing.assert_array_equal(predicted, y)

    protocol = first.protocol_dict()
    assert protocol == {
        "architecture": "single_affine_softmax_layer",
        "primary_class_labels": list(PLASTICC_PRIMARY_CLASS_LABELS),
        "open_set_class_label": 99,
        "open_set_class_fit_authorized": False,
        "standardization": "development_fit_mean_and_population_std_only",
        "class_weighting": "equal_total_weight_per_development_class",
        "optimizer": "deterministic_full_batch_gradient_descent",
        "learning_rate": 0.1,
        "l2_weight_penalty": 1e-4,
        "bias_regularized": False,
        "steps": 2000,
        "early_stopping": False,
        "heldout_input_to_fit_authorized": False,
    }


def test_linear_readout_fails_closed_if_seen_class_universe_is_incomplete_or_contaminated() -> None:
    x, y = _readout_fixture()
    with pytest.raises(ValueError, match="exactly the frozen 14"):
        PlasticcLinearReadout.fit(x[:-2], y[:-2])
    with pytest.raises(ValueError, match="exactly the frozen 14"):
        contaminated = y.copy()
        contaminated[-1] = PLASTICC_OPEN_SET_CLASS_LABEL
        PlasticcLinearReadout.fit(x, contaminated)
    with pytest.raises(ValueError, match="finite"):
        bad = x.copy()
        bad[0, 0] = np.nan
        PlasticcLinearReadout.fit(bad, y)


def test_primary_seen_class_mask_prospectively_excludes_only_class_99() -> None:
    labels = np.asarray([6, 15, 99, 95, 99, 42], dtype=np.int64)
    mask = plasticc_primary_seen_class_mask(labels)
    np.testing.assert_array_equal(mask, np.asarray([True, True, False, True, False, True]))

    with pytest.raises(ValueError, match="outside the frozen PLAsTiCC class universe"):
        plasticc_primary_seen_class_mask(np.asarray([6, 123], dtype=np.int64))
    with pytest.raises(ValueError, match="contains no objects"):
        plasticc_primary_seen_class_mask(np.asarray([99, 99], dtype=np.int64))


def _write_fixture(path, *, extra_column: str | None = None) -> None:
    header = ["object_id", "mjd", "passband", "flux", "flux_err", "detected"]
    if extra_column is not None:
        header.append(extra_column)
    rows = [
        ["2", "3.0", "1", "20.0", "0.2", "1"],
        ["1", "2.0", "0", "11.0", "0.1", "1"],
        ["1", "1.0", "1", "10.0", "0.1", "0"],
        ["2", "1.0", "0", "19.0", "0.3", "1"],
    ]
    if extra_column is not None:
        rows = [row + ["90"] for row in rows]
    path.write_text(
        ",".join(header) + "\n" + "\n".join(",".join(row) for row in rows) + "\n",
        encoding="utf-8",
    )


def test_outcome_blind_parser_requires_exact_feature_surface_and_never_returns_labels(tmp_path) -> None:
    fixture = tmp_path / "plasticc.csv"
    _write_fixture(fixture)
    objects = load_plasticc_lightcurves_outcome_blind(fixture)

    assert PLASTICC_LIGHTCURVE_COLUMNS == {
        "object_id",
        "mjd",
        "passband",
        "flux",
        "flux_err",
        "detected",
    }
    assert [obj.object_id for obj in objects] == [1, 2]
    assert all(obj.light_curve.labels is None for obj in objects)
    np.testing.assert_array_equal(objects[0].light_curve.times, np.array([1.0, 2.0]))
    np.testing.assert_array_equal(objects[0].light_curve.values, np.array([10.0, 11.0], dtype=np.float32))


def test_outcome_blind_parser_rejects_unblinded_target_or_any_extra_column(tmp_path) -> None:
    fixture = tmp_path / "plasticc_with_target.csv"
    _write_fixture(fixture, extra_column="target")
    with pytest.raises(ValueError, match=r"extra=\['target'\]"):
        load_plasticc_lightcurves_outcome_blind(fixture)


def test_outcome_blind_parser_rejects_invalid_observation_values(tmp_path) -> None:
    fixture = tmp_path / "bad.csv"
    fixture.write_text(
        "object_id,mjd,passband,flux,flux_err,detected\n"
        "1,1.0,0,2.0,-0.1,1\n",
        encoding="utf-8",
    )
    with pytest.raises(ValueError, match="flux_err"):
        load_plasticc_lightcurves_outcome_blind(fixture)
