from local_diffusion_operator.benchmark import run_trial
from local_diffusion_operator.model import fit_local_operator, periodic_laplacian


def test_periodic_laplacian_is_translation_invariant_for_constant_state():
    assert periodic_laplacian([3.0, 3.0, 3.0, 3.0]) == [0.0, 0.0, 0.0, 0.0]


def test_fit_recovers_exact_diffusion_coefficient():
    states = [
        [0.0, 1.0, 0.0, -1.0],
        [1.0, 0.0, -1.0, 0.0],
    ]
    alpha = 0.2
    next_states = []
    for state in states:
        lap = periodic_laplacian(state)
        next_states.append([u + alpha * l for u, l in zip(state, lap)])
    model = fit_local_operator(states, next_states)
    assert abs(model.coefficient - alpha) < 1e-12


def test_diffusion_screen_preserves_negative_result_against_75pct_gate():
    results = [run_trial(seed, "diffusion") for seed in range(10)]
    mean_improvement = sum(r.relative_improvement for r in results) / len(results)
    mean_coeff = sum(r.learned_coefficient for r in results) / len(results)
    assert 0.60 < mean_improvement < 0.75
    assert abs(mean_coeff - 0.18) < 0.01
    assert all(r.stencil_width == 3 for r in results)


def test_zero_diffusion_negative_control_does_not_claim_large_gain():
    results = [run_trial(seed, "zero_diffusion") for seed in range(10)]
    mean_improvement = sum(r.relative_improvement for r in results) / len(results)
    mean_coeff = sum(abs(r.learned_coefficient) for r in results) / len(results)
    assert mean_improvement < 0.05
    assert mean_coeff < 0.01
