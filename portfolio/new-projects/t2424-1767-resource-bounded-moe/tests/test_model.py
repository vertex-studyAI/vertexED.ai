from resource_bounded_moe.benchmark import run_trial
from resource_bounded_moe.model import fit_affine, fit_threshold_moe, rmse


def test_affine_fit_recovers_exact_line():
    xs = [-2, -1, 0, 1, 2]
    ys = [3 * x - 2 for x in xs]
    model = fit_affine(xs, ys)
    assert abs(model.slope - 3.0) < 1e-12
    assert abs(model.intercept + 2.0) < 1e-12
    assert rmse(ys, model.predict(xs)) < 1e-12


def test_threshold_moe_learns_piecewise_structure():
    xs = [i / 10 for i in range(-40, 41)]
    ys = [2 * x + 1 if x <= 0 else -x + 1 for x in xs]
    model = fit_threshold_moe(xs, ys, min_partition=10)
    assert abs(model.threshold) <= 0.1
    assert rmse(ys, model.predict(xs)) < 1e-9
    assert model.active_experts_per_sample == 1
    assert model.total_experts == 2


def test_piecewise_benchmark_beats_single_affine_baseline():
    results = [run_trial(seed, "piecewise") for seed in range(10)]
    mean_improvement = sum(r.relative_improvement for r in results) / len(results)
    assert mean_improvement > 0.70
    assert max(abs(r.learned_threshold) for r in results) < 0.35


def test_linear_negative_control_does_not_claim_large_gain():
    results = [run_trial(seed, "linear") for seed in range(10)]
    mean_improvement = sum(r.relative_improvement for r in results) / len(results)
    assert mean_improvement < 0.10
