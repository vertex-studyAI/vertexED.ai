# T2424-0034 Status

## Current state

`CANONICAL_WALKFORWARD_RECONCILIATION / CI_VERIFICATION_PENDING`

The descriptive package is already merged/tested on `main`. This branch reconciles the useful historical-only walk-forward mechanics from noncanonical PR #160 into the canonical project tree without double-counting T2424-0034.

## Substance present

### Existing canonical package

- [x] deterministic quantitative metrics library
- [x] self-contained SVG/HTML renderer
- [x] runnable JSON → HTML CLI
- [x] sample input
- [x] descriptive root-level regression tests
- [x] documented interface and limitations

### Reconciled extension

- [x] log-return transformation
- [x] rolling historical-only feature
- [x] expanding-history linear fit
- [x] explicit score-before-train no-lookahead ordering
- [x] long/flat/short signal mechanics
- [x] turnover and basis-point cost accounting
- [x] strategy/benchmark equity summaries
- [x] future-price-mutation regression
- [x] warm-up regression
- [x] transaction-cost regression
- [ ] canonical repository CI verified on this exact reconciliation head

### Research gate still missing

- [ ] frozen legally usable real-market dataset
- [ ] predeclared chronological train/validation/test protocol
- [ ] stronger comparator strategies/models under the same cost budget
- [ ] untouched external test-period evidence
- [ ] raw prediction/position/cost artifacts
- [ ] uncertainty/robustness analysis
- [ ] independent research reproduction

## Completion boundary

If exact-head canonical CI passes, this branch can strengthen T2424-0034 as a **tested quantitative developer tool with a certified no-lookahead evaluation-mechanics extension**.

It still must **not** be counted as a validated quantitative-ML research result. No real-market predictive hypothesis has been tested under a frozen external protocol, and no alpha, profitability, ML-superiority, or investment claim is supported.

## Expected verification

```bash
node --test tests/project2424T0034QuantMlVisualizer.test.mjs
node --test tests/project2424T0034WalkForward.test.mjs
npm test
npm run ci
```

If this reconciliation passes, close/supersede noncanonical PR #160 rather than merging both project trees.
