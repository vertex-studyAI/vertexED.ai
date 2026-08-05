# FI-JEPA baseline recovery

Target: `build-the-future-11/FinanceMeta-Global` at commit `6191c2bc98118709b3437e04666af4b51a96ee65`.

The target currently contains an empty `FI-JEPA/init.py` and a one-line descriptive README, but no model, data protocol, tests, or executable experiment. Direct publication is blocked because the GitHub App cannot create refs in the personal repository.

This bundle adds a deliberately small, reproducible research baseline. It predicts future-window embeddings from past context embeddings, keeps the target encoder as an exponential moving average of the context encoder, uses chronological splits, and evaluates a frozen representation with a ridge probe. The default experiment uses synthetic data and makes no market-performance or novelty claim.

After repository access is restored, apply the generated patch from this directory to the exact target commit, install with `python -m pip install -e 'FI-JEPA[dev]'`, then run `pytest FI-JEPA/tests -q` and `python -m fi_jepa.cli --epochs 40`.
