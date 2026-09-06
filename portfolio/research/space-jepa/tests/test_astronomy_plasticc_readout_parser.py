from __future__ import annotations

import numpy as np
import pytest

from space_jepa.plasticc import (
    PLASTICC_LIGHTCURVE_COLUMNS,
    PlasticcLinearReadout,
    load_plasticc_lightcurves_outcome_blind,
)


def test_linear_readout_is_deterministic_train_only_and_probabilistic() -> None:
    x = np.array(
        [
            [-2.0, -1.0],
            [-1.0, -1.0],
            [-2.0, -2.0],
            [1.0, 1.0],
            [2.0, 1.0],
            [2.0, 2.0],
        ],
        dtype=np.float64,
    )
    y = np.array([10, 10, 10, 20, 20, 20], dtype=np.int64)

    first = PlasticcLinearReadout.fit(x, y)
    second = PlasticcLinearReadout.fit(x, y)
    np.testing.assert_array_equal(first.weights, second.weights)
    np.testing.assert_array_equal(first.bias, second.bias)
    np.testing.assert_array_equal(first.mean, x.mean(axis=0))
    np.testing.assert_array_equal(first.classes, np.array([10, 20]))

    probabilities = first.predict_proba(x)
    np.testing.assert_allclose(probabilities.sum(axis=1), 1.0, rtol=0.0, atol=1e-12)
    predicted = first.classes[np.argmax(probabilities, axis=1)]
    np.testing.assert_array_equal(predicted, y)

    protocol = first.protocol_dict()
    assert protocol == {
        "architecture": "single_affine_softmax_layer",
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


def test_linear_readout_fails_closed_on_bad_training_surface() -> None:
    x = np.array([[0.0], [1.0], [2.0]], dtype=np.float64)
    with pytest.raises(ValueError, match="at least two objects"):
        PlasticcLinearReadout.fit(x, np.array([0, 0, 1]))
    with pytest.raises(ValueError, match="finite"):
        bad = x.copy()
        bad[0, 0] = np.nan
        PlasticcLinearReadout.fit(bad, np.array([0, 0, 1]))
    with pytest.raises(ValueError, match="at least two development classes"):
        PlasticcLinearReadout.fit(np.vstack([x, [[3.0]]]), np.array([1, 1, 1, 1]))


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
