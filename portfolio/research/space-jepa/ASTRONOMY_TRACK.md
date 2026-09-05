# Space-JEPA astronomy track — pre-outcome protocol

## Why this exists

The ESA-ADB spacecraft-telemetry experiment remains the first engineering baseline in this repository. The astronomy collaboration is a distinct research track: learn temporal representations of astronomical observations and test whether a JEPA objective captures changes that are useful for transient/novelty detection or forecasting.

Do not merge the two claims. A positive spacecraft-telemetry result would not establish an astronomy result, and an astronomy case study would not establish a spacecraft-telemetry result.

## Narrow first question

**Does an irregular-time-aware JEPA representation improve future-latent prediction and held-out transient ranking relative to a time-agnostic JEPA and simple photometric baselines?**

The intended first data family is public multi-epoch photometry (for example ZTF/ALeRCE-style light curves). Aadi Nair's reported transient can be used as a qualitative held-out case only after the method and thresholds are frozen; it must not be the sole evaluation set or a tuning target.

## Representation

Each observation is represented as an event token, preserving irregular cadence instead of interpolating to a fake regular grid:

- robust-scaled magnitude/flux feature
- robust-scaled reported photometric uncertainty
- robust-scaled `log1p(delta_time)` since the previous observation
- one-hot passband identity, with an explicit unknown-band bucket

The featurizer is fit on training observations only. For an object-level benchmark, `LightCurveFeaturizer.fit_many` fits a single scaler and passband vocabulary from the complete set of training objects and receives no validation/test objects. Delta time is constructed separately inside each object before fitting, so the arbitrary gap between two unrelated light curves can never become a feature statistic. Future observations may use the learned scaling parameters and band vocabulary but cannot update them.

## Frozen comparison

1. **Time-aware JEPA:** observation value + uncertainty + delta-time + passband.
2. **Time-agnostic JEPA:** same architecture and split, with time-gap feature removed/zeroed.
3. **Persistence baseline:** next observation value assumed equal to the previous observation in the same normalized representation where meaningful.
4. **Robust deviation baseline:** train-fit robust deviation of observation features.

Primary retained metrics must be chosen to match the actual public benchmark/task before viewing held-out labels. For a labeled transient-ranking dataset, report at least average precision and AUROC, plus a precision/recall operating point fixed from training/validation data. For forecasting, report a predeclared latent/photometric prediction metric on a held-out chronological block.

## Leakage rules

- chronological split or benchmark-provided split only
- object identity must be disjoint across train/validation/test whenever the benchmark consists of separate astronomical objects
- scaler and passband vocabulary fit on training observations/objects only
- context/target windows may never cross from one astronomical object into another
- no held-out labels for thresholds, early stopping, feature selection, or architecture choice
- no tuning on Aadi's reported transient or any other named showcase object
- retain null/negative results and all frozen seeds

## Immediate implementation included here

`space_jepa.astro.LightCurveFeaturizer` converts irregular light-curve events into model-ready feature vectors without interpolation. `LightCurveFeaturizer.fit_many` supports one train-only transform across multiple training objects. `space_jepa.training.MultiSequenceWindowDataset` and `train_model_sequences` train the existing `SpaceJEPA` backbone over multiple independent light curves without concatenating them or permitting a context/target window to cross an object boundary. `score_sequences` preserves that boundary during evaluation. The same fitted transform and backbone can therefore run a time-aware and time-agnostic ablation with identical capacity.

These are experiment-enabling controls, not astronomy results. No public transient benchmark has been claimed as executed by this document.

## Promotion gate

No astronomy claim is retained until the run records dataset identity/hash, exact object/split identities, code commit, config, seed, raw scores/predictions, baseline outputs, and the frozen evaluation metric. Named transient examples are illustrations after the quantitative evaluation, never substitutes for it.
