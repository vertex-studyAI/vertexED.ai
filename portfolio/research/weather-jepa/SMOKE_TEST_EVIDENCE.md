# Weather-JEPA v1 smoke-test evidence

Evidence class: `IMPLEMENTATION_SMOKE_TEST_ONLY`

This is not scientific forecasting evidence and does not authorize a performance claim.

## Executed locally before branch handoff

Runtime observed:

- Python environment with PyTorch `2.10.0+cpu`
- NumPy `2.3.5`
- command: `python -m unittest -v`

Result:

- `test_fit_and_evaluate_contracts` — PASS
- `test_latent_loss_is_finite` — PASS
- `test_predict_shape_matches_target_shape` — PASS
- `test_rejects_non_divisible_spatial_shape` — PASS
- `test_target_encoder_is_frozen` — PASS
- total: `5/5 PASS`

The test content was then written to `test_weather_jepa.py` and the implementation to `weather_jepa.py` on branch `research/weather-jepa-v1-freeze-20260815`.

## Boundary

Exact GitHub-branch CI has not yet been independently verified. Real ERA5/WeatherBench data has not been loaded. No scientific outcome training has been run. Forecast quality, calibration, robustness, long-horizon advantage, and external validity remain `UNKNOWN`.
