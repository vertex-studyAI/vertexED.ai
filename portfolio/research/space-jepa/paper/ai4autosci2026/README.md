# Space-JEPA — AI4AutoSci @ IEEE BigData 2026 submission track

Status: **PRE-OUTCOME / SUBMISSION PREPARATION ONLY**

Target: AI4AutoSci 2026, the AI for Autonomous Experimental Science workshop at IEEE BigData 2026.

## Submission thesis

The flagship paper should be built around the **ESA spacecraft-telemetry experiment**, not around PLAsTiCC.

The workshop's strongest fit is instrument operation and maintenance: Space-JEPA asks whether future-latent prediction can learn a useful predictive state for scientific-instrument telemetry and improve anomaly/failure-mode detection under a leakage-controlled, label-free representation-learning protocol.

The astronomy/PLAsTiCC work remains a **separate scientific track**. It may appear only as a clearly bounded secondary/cross-domain experiment if its own pre-outcome gates are independently closed. A positive ESA result must never be used as evidence for an astronomy claim, and vice versa.

## Working title

**Space-JEPA: Predictive Latent State Learning for Scientific Instrument Telemetry Anomaly Detection**

Alternative if the channel-aware evaluation becomes admissible and scientifically informative:

**Space-JEPA: Predictive Latent State Learning for Failure-Mode Detection and Localization in Spacecraft Telemetry**

Do not use the second title unless retained channel-aware evidence actually supports the localization wording.

## One-sentence research question

Does JEPA-style future-latent prediction improve spacecraft telemetry anomaly detection under a leakage-controlled evaluation relative to fixed simple baselines, without anomaly labels during representation training or threshold fitting?

## Core contribution stack

1. A future-latent predictive representation for multivariate spacecraft telemetry.
2. A strict pre-outcome protocol: train-only scaling, label-free threshold fitting, frozen seeds, immutable retained-run receipts, and explicit negative-result retention.
3. Matched simple comparators: robust z-score and one-step persistence, plus official ESA-ADB benchmark methods where admissible.
4. An optional predeclared per-channel decoder that exposes channel-resolved residuals for the official ChannelAwareFScore path without fitting on anomaly labels.
5. Reproducibility artifacts binding source revision, configuration, dataset bytes/identities, thresholds, checkpoint, raw scores, metrics, and baselines.

## Non-claims

Until outcome-bearing execution is independently authorized and retained:

- no ESA-ADB performance claim;
- no superiority claim over any baseline;
- no failure-localization claim;
- no causal-channel claim;
- no ADTQC improvement claim;
- no real-sky astronomy validation claim;
- no PLAsTiCC confirmatory claim.

Synthetic fixtures and CI are engineering evidence only.

## Frozen experiment hierarchy

### Primary paper lane — ESA spacecraft telemetry

Authoritative protocol: `../../PROTOCOL.md`.

- seeds: `17, 29, 43, 71, 101`;
- global Space-JEPA latent prediction-error score remains primary;
- train-only robust normalization;
- train-only 0.995 score-quantile threshold;
- minimum comparators: robust z-score and one-step persistence;
- official ESA-ADB metrics are primary once the pinned benchmark evaluation is admissibly executed;
- all seeds and all adverse/null outcomes must be retained;
- no post-outcome threshold, seed, baseline, or claim rescue.

### Secondary ESA lane — channel-aware failure-mode surface

Authoritative amendment: `../../ESA_CHANNEL_PROBE_PROTOCOL_V0.md`.

- secondary only; does not replace the global primary;
- ridge decoder alpha `1.0`;
- probe-fit stride `4`;
- score stride `1`;
- batch size `128`;
- one train-only `0.995` threshold per channel;
- matched robust-z and persistence channel surfaces;
- official ChannelAwareFScore adapter remains outcome-bearing and must stay blocked until its provenance/authorization gate closes.

### Separate optional lane — astronomy / PLAsTiCC

Authoritative protocol: `../../ASTRONOMY_TRACK.md`.

Keep this scientifically independent from ESA. The frozen confirmatory comparison is time-aware versus same-capacity time-agnostic JEPA with the already frozen class-balanced log-loss decision rule and seeds `11, 23, 37, 53, 71`.

PLAsTiCC is simulated and currently public/unblinded. It cannot establish real-sky validation and must fall back to development/external-characterization evidence if freshness cannot be independently established.

## Paper build order

1. Close every remaining **pre-outcome ESA gate** without opening held-out outcomes.
2. Freeze the exact manuscript-facing experimental matrix and artifact schema.
3. Obtain independent protocol review/authorization.
4. Execute the frozen ESA runs exactly once per authorized seed/configuration family and retain every outcome.
5. Populate the Results section from retained artifacts only.
6. Run prespecified ablations only; report null/negative ablations unchanged.
7. Adversarially review claims against the evidence ledger.
8. Convert to the official IEEE BigData 2-column template and keep the manuscript double-blind.
9. Submit by the workshop deadline only if the evidence package is complete enough for an honest paper.

## Files in this directory

- `main.tex` — double-blind pre-outcome manuscript shell.
- `EXPERIMENT_MATRIX.md` — exact experiment hierarchy, evidence requirements, and claim mapping.
- `SUBMISSION_CHECKLIST.md` — venue and scientific-readiness checklist.
- `SUBMISSION_STATE_V0.json` — machine-readable fail-closed submission state.

The submission package is intentionally allowed to say **not ready**. A deadline is never authorization to weaken the scientific protocol.