import math
import unittest

import torch

from weather_jepa import WeatherJEPAConfig, WeatherJEPAModel


class WeatherJEPASmokeTests(unittest.TestCase):
    def setUp(self) -> None:
        torch.manual_seed(7)
        self.config = WeatherJEPAConfig(
            input_channels=5,
            embed_dim=16,
            spatial_patch=4,
            predictor_depth=1,
            mask_ratio=0.5,
            seed=101,
        )
        self.model = WeatherJEPAModel(self.config)
        self.context = torch.randn(2, 4, 5, 16, 16)
        self.target = torch.randn(2, 4, 5, 16, 16)

    def test_predict_shape_matches_target_shape(self) -> None:
        prediction = self.model.predict(self.context)
        self.assertEqual(prediction.shape, self.target.shape)

    def test_latent_loss_is_finite(self) -> None:
        generator = torch.Generator().manual_seed(13)
        loss = self.model.latent_loss(self.context, self.target, generator=generator)
        self.assertTrue(math.isfinite(float(loss.detach())))
        self.assertGreater(float(loss.detach()), 0.0)

    def test_target_encoder_is_frozen(self) -> None:
        self.assertTrue(
            all(not parameter.requires_grad for parameter in self.model.target_encoder.parameters())
        )

    def test_fit_and_evaluate_contracts(self) -> None:
        batches = [(self.context, self.target)]
        losses = self.model.fit(batches, epochs=1)
        self.assertEqual(len(losses), 1)
        metrics = self.model.evaluate(batches)
        self.assertTrue(math.isfinite(metrics["rmse"]))
        self.assertTrue(math.isfinite(metrics["mae"]))

    def test_rejects_non_divisible_spatial_shape(self) -> None:
        context = torch.randn(1, 4, 5, 15, 16)
        target = torch.randn(1, 4, 5, 15, 16)
        with self.assertRaises(ValueError):
            self.model.latent_loss(context, target)


if __name__ == "__main__":
    unittest.main()
