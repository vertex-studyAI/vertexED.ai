# T2424-0025 Figure Audit

Status: **EVIDENCE-DERIVED FIGURES GENERATED; MANUSCRIPT STILL NO-GO**

## Source lock

All plotted points come from:

- `../raw_metrics/repro-wave-20260812.json`
- frozen experiment source recorded there: `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`
- independent reproduction anchor: PR #311 / merge commit `715aea0b632c70493c226a84473d77ff7ca8cfc6`

No new experiment output, interpolation, visual estimation, or hand-invented point is used.

## Figure 1

`figure1_contamination_mae.svg` plots the retained 50-seed contamination-sweep MAE for:

- arithmetic mean;
- weighted median;
- 10% weighted trimmed mean;
- Huber readout.

The y-axis is logarithmic and is labelled as such because arithmetic-mean MAE spans a much larger range than the robust readouts.

## Figure 2

`figure2_relative_improvement.svg` plots

`(mean_mae - median_mae) / mean_mae`

for each retained contamination level. Exact derived values are saved in `FIGURE_DATA.json`.

The 0% contamination value is `0.4900015846867857` (49.0%). It is deliberately annotated as the central negative control against a uniquely heavy-tail or uniquely non-Gaussian mechanism attribution.

## Regeneration

From the repository root:

```bash
node portfolio/project2424/projects/T2424-0025/figures/generate.mjs
```

The generator reads the retained machine-readable metrics directly and writes both SVGs plus `FIGURE_DATA.json`.

## Claim boundary

These figures support a bounded robust-readout result on the frozen synthetic task. They do not establish a Transformer result, learned-memory result, or uniquely non-Gaussian mechanism.
