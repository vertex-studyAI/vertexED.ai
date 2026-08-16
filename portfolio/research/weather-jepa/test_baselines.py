import math
import unittest

import torch

from baselines import persistence_error_smoke, persistence_forecast


class WeatherJEPAPersistenceBaselineTests(unittest.TestCase):
    def setUp(self) -> None:
        torch.manual_seed(19)
        self.context = torch.randn(2, 4, 5, 8, 12)

    def test_repeats_only_the_last_observed_state(self) -> None:
        forecast = persistence_forecast(self.context, forecast_steps=3)
        self.assertEqual(forecast.shape, (2, 3, 5, 8, 12))
        for step in range(3):
            torch.testing.assert_close(forecast[:, step], self.context[:, -1])

    def test_forecast_does_not_alias_context_storage(self) -> None:
        forecast = persistence_forecast(self.context, forecast_steps=2)
        before = self.context.clone()
        forecast[:, 0].zero_()
        torch.testing.assert_close(self.context, before)

    def test_preserves_dtype_and_device(self) -> None:
        context = self.context.to(dtype=torch.float64)
        forecast = persistence_forecast(context, forecast_steps=2)
        self.assertEqual(forecast.dtype, context.dtype)
        self.assertEqual(forecast.device, context.device)

    def test_rejects_invalid_shapes_and_horizons(self) -> None:
        with self.assertRaises(ValueError):
            persistence_forecast(torch.randn(2, 5, 8, 12), forecast_steps=1)
        with self.assertRaises(ValueError):
            persistence_forecast(self.context, forecast_steps=0)
        with self.assertRaises(TypeError):
            persistence_forecast(self.context, forecast_steps=1.5)
        with self.assertRaises(TypeError):
            persistence_forecast(self.context, forecast_steps=True)

    def test_engineering_smoke_metrics_are_finite_on_synthetic_fixture(self) -> None:
        target = torch.randn(2, 3, 5, 8, 12)
        metrics = persistence_error_smoke(self.context, target)
        self.assertTrue(math.isfinite(metrics["rmse_smoke"]))
        self.assertTrue(math.isfinite(metrics["mae_smoke"]))
        self.assertGreaterEqual(metrics["rmse_smoke"], 0.0)
        self.assertGreaterEqual(metrics["mae_smoke"], 0.0)


if __name__ == "__main__":
    unittest.main()
