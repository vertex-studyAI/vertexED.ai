# AI4AutoSci 2026 submission checklist

Venue facts were captured on 2026-09-06 from the official AI4AutoSci 2026 workshop page. Re-check the official page before submission because the portal was not yet announced when this package was created.

## Venue constraints

- [x] Target: AI4AutoSci @ IEEE BigData 2026.
- [x] Submission deadline currently listed as **2026-10-31**.
- [x] Notification currently listed as **2026-11-21**.
- [x] Camera-ready currently listed as **2026-11-28**.
- [x] IEEE two-column format.
- [x] Up to 10 pages.
- [x] Double-blind review.
- [x] Accepted work listed for IEEE BigData workshop proceedings.
- [x] Presentation listed as in-person.
- [ ] Re-check final CFP and submission portal immediately before submission.
- [ ] Confirm whether references/appendices count toward the 10-page limit under the final IEEE BigData instructions.
- [ ] Confirm exact deadline time zone from the submission system when it opens.

## Scientific gate — ESA primary

Do **not** tick these from memory; require retained evidence.

- [ ] Exact admissible ESA-ADB dataset identities frozen and independently checked.
- [ ] Exact official preprocessing/evaluation source identities frozen.
- [ ] Training/test boundary verified leakage-free.
- [ ] No anomaly label access during scaling, representation training, threshold fitting, model selection, or early stopping.
- [ ] Frozen seeds `17,29,43,71,101` confirmed in executable config/runner.
- [ ] Global 0.995 training-score threshold rule unchanged.
- [ ] Robust-z comparator frozen.
- [ ] Persistence comparator frozen.
- [ ] Official benchmark metrics pinned and executable.
- [ ] Exact runtime/hardware/environment identity frozen.
- [ ] Independent pre-outcome review/authorization retained.
- [ ] All five primary runs executed on the exact authorized protocol.
- [ ] Every primary run retained, including failed/null/adverse runs.
- [ ] Raw scores/predictions retained for every run.
- [ ] Baseline outputs retained.
- [ ] Official metrics retained.
- [ ] Run receipts bind code/config/data/checkpoint/threshold/raw outputs/metrics.

## Secondary channel-aware gate

- [ ] Frozen metadata identities independently reviewed.
- [ ] Official ChannelAwareFScore implementation/source identity unchanged.
- [ ] Space-JEPA, robust-z, and persistence surfaces exactly aligned.
- [ ] Frozen ridge alpha/strides/batch size/threshold quantile unchanged.
- [ ] All five frozen seed surfaces retained where stochastic.
- [ ] No outcome used to alter the decoder, thresholds, categories, or baselines.
- [ ] Channel-aware manuscript language limited to what the official metric demonstrates.
- [ ] No causal-channel or root-cause claim without separate causal evidence.

## Manuscript gate

- [x] Double-blind author placeholder only.
- [x] Method section drafted without outcome fabrication.
- [x] Protocol section reflects frozen hierarchy.
- [x] Results placeholders fail visibly before outcome insertion.
- [x] Limitations distinguish detection, localization, causality, and control.
- [x] PLAsTiCC explicitly separated from ESA and described as simulated.
- [ ] Related-work citations completed and verified against primary sources.
- [ ] Exact benchmark citations completed and verified.
- [ ] Results populated directly from retained artifacts, not hand-copied from transient console output.
- [ ] Tables regenerate from retained machine-readable result packages where feasible.
- [ ] All frozen seeds visible in paper/supplementary evidence.
- [ ] No best-seed cherry-picking.
- [ ] No secondary-metric rescue of a failed primary endpoint.
- [ ] Adverse/null outcome language preserved if applicable.
- [ ] Figures have provenance back to retained artifacts.
- [ ] Abstract rewritten only after results are frozen.
- [ ] Conclusion reconciled to actual outcome.
- [ ] Claims audit completed sentence-by-sentence.
- [ ] Anonymous metadata scrubbed from PDF and source package where required.
- [ ] IEEE template build succeeds.
- [ ] Final page count <= 10 under official counting rules.
- [ ] Submission PDF visually inspected.

## Astronomy / PLAsTiCC optional gate

Do not delay a strong ESA paper merely to add this track.

- [ ] Representation-to-probability readout frozen pre-outcome.
- [ ] Dataset byte receipts frozen.
- [ ] Development split identities frozen.
- [ ] Licensing/use review complete.
- [ ] Outcome-blind parser verified.
- [ ] Runtime identity frozen.
- [ ] Independent freshness review complete.
- [ ] Independent approval receipt retained.
- [ ] If freshness fails, manuscript labels PLAsTiCC development/external-characterization only.
- [ ] Manuscript explicitly states PLAsTiCC is simulated.
- [ ] No real-sky validation language unless a separate real-observation benchmark exists.

## Submission rule

**The deadline does not override the evidence gate.** If the paper is not scientifically defensible by the deadline, submit a narrower honest paper or do not submit. Never open outcomes early, weaken frozen controls, or manufacture a positive claim to meet the workshop date.