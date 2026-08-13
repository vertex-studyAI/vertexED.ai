from __future__ import annotations

import importlib.util
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "portfolio" / "research" / "ngmt" / "v01" / "run.py"
spec = importlib.util.spec_from_file_location("ngmt_v01", MODULE_PATH)
ngmt = importlib.util.module_from_spec(spec)
assert spec.loader is not None
spec.loader.exec_module(ngmt)


def test_frozen_counts_and_window_contract():
    assert ngmt.TRAIN_SEEDS == [11, 23, 37]
    assert ngmt.ANCHORS == [31, 47, 63, 78]
    assert ngmt.CONTEXT == 16
    assert ngmt.SEQ_LEN == 80
    train, validation = ngmt.generate_train_validation(11)
    assert len(train) == 640
    assert len(validation) == 160
    x, m, y = ngmt.make_examples(train, "B0")
    assert x.shape == (2560, 16, 1)
    assert m.shape == (2560, 2)
    assert y.shape == (2560, 1)


def test_shared_model_parameter_count_is_arm_independent():
    ngmt.set_seed(11)
    model = ngmt.TinyTransformer()
    count = ngmt.trainable_parameters(model)
    assert count > 0
    assert {arm: count for arm in ngmt.ARMS} == {"B0": count, "B1": count, "B2": count, "B3": count}


def test_b1_b2_b3_runtime_memory_capacity_is_exactly_18_scalars():
    for arm in ["B1", "B2", "B3"]:
        memory = ngmt.OnlineMemory(arm)
        assert memory.state.scalar_capacity == 18


def test_b0_is_zero_memory_feature():
    seq = np.linspace(-1.0, 1.0, 80)
    features = ngmt.memory_features(seq, "B0")
    assert features.shape == (80, 2)
    assert np.array_equal(features, np.zeros_like(features))


def test_student_t_write_downweights_large_outlier_relative_to_gaussian():
    # Seed identical states with six ordinary observations, then compare the
    # location-state displacement caused by one very large outlier.
    seed_values = [0.0, 0.1, -0.1, 0.2, -0.2, 0.05]
    gaussian = ngmt.OnlineMemory("B2")
    student = ngmt.OnlineMemory("B3")
    for value in seed_values:
        gaussian.consume(value)
        student.consume(value)

    before_g = gaussian.state.mu.copy()
    before_t = student.state.mu.copy()
    gaussian.consume(20.0)
    student.consume(20.0)
    displacement_g = float(np.linalg.norm(gaussian.state.mu - before_g))
    displacement_t = float(np.linalg.norm(student.state.mu - before_t))
    assert displacement_t < displacement_g


def test_data_generation_is_deterministic_and_eval_conditions_are_fixed():
    a_train, a_val = ngmt.generate_train_validation(23)
    b_train, b_val = ngmt.generate_train_validation(23)
    assert all(np.array_equal(a, b) for a, b in zip(a_train, b_train))
    assert all(np.array_equal(a, b) for a, b in zip(a_val, b_val))
    eval_a = ngmt.generate_evaluation(23)
    eval_b = ngmt.generate_evaluation(23)
    assert list(eval_a) == ngmt.EVAL_CONDITIONS
    for condition in ngmt.EVAL_CONDITIONS:
        assert len(eval_a[condition]) == 120
        assert all(np.array_equal(a, b) for a, b in zip(eval_a[condition], eval_b[condition]))
