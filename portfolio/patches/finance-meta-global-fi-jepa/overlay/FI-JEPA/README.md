# FI-JEPA: executable baseline

FI-JEPA is an **unvalidated research prototype** for testing whether a joint-embedding predictive objective can learn useful representations from multivariate financial time series. The repository does not currently contain evidence that FI-JEPA is novel, superior to simpler methods, profitable, or suitable for live trading.

## Research question

Can an encoder trained to predict the latent representation of a held-out future block from a past context block produce features that are useful to a frozen downstream probe?

The baseline adapts the central JEPA idea—predicting targets in representation space instead of reconstructing raw inputs—from I-JEPA and V-JEPA. Financial sequences require different masking and evaluation rules: all context observations precede every target observation, splits are chronological, and no future sample may enter fitting or normalization.

Primary background:

- Assran et al., *Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture*, CVPR 2023: https://arxiv.org/abs/2301.08243
- Bardes et al., *Revisiting Feature Prediction for Learning Visual Representations from Video*, 2024: https://ai.meta.com/research/publications/revisiting-feature-prediction-for-learning-visual-representations-from-video/
- Sobal et al., *Joint Embedding Predictive Architectures Focus on Slow Features*, 2022: https://arxiv.org/abs/2211.10831

## What is implemented

- deterministic synthetic regime-switching market panels;
- past-only context and strictly later target windows;
- chronological train/validation splits with no shared observations;
- a NumPy context encoder, EMA target encoder, and latent predictor;
- a frozen ridge probe and persistence baseline;
- deterministic tests for leakage, reproducibility, optimization, and reporting.

This is intentionally a CPU baseline. It is small enough to inspect line by line and strong enough to establish a reproducible experiment contract before introducing transformers, real datasets, or claims.

## Run

```bash
python -m pip install -e '.[dev]'
pytest -q
python -m fi_jepa.cli --epochs 40
```

The CLI prints JSON containing the seed, split sizes, training loss, probe error, directional accuracy, and persistence-baseline error.

## Required next experiments

Before any manuscript claim, add licensed point-in-time market data, asset-universe and survivorship controls, walk-forward evaluation, multiple seeds, linear and autoregressive baselines, ablations for horizon and EMA momentum, collapse diagnostics, transaction-cost-free representation metrics, and confidence intervals. Any trading study must remain separate from representation pretraining and must not be presented as financial advice.
