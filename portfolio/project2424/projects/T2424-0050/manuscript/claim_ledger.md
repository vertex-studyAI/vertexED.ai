# T2424-0050 Manuscript Claim Ledger

| Claim | Evidence | Allowed? | Scope |
|---|---|---|---|
| 20-seed bounded screen reduces mean pressure MAE from 0.0658913916 to 0.0011366559 (97.8766%). | `results/reference.json`; fresh 2026-08-22 reproduction in `STATUS.md`; `experiment/run.mjs` | YES | Controlled 1D block-structured synthetic screen. |
| Mean flux relative error is approximately 1.369e-16 in the bounded screen. | `results/reference.json`; fresh reproduction | YES | Expected from harmonic resistance preservation; not learned generalization. |
| Harder audit mean improvement vs linear is 63.8317%, 77.1634%, 86.1675% for rho 0,0.5,0.9. | `results/misaligned-audit.json` | YES | Synthetic 1D misaligned/correlated audit. |
| Harmonic beats arithmetic in 100/100, 99/100, 96/100 cases across the same three conditions. | `results/misaligned-audit.json` | YES | Same audit. |
| Harmonic is universally better than the linear baseline. | `rho=0`, seed 6: harmonic MAE 0.0296197 > linear 0.0269153. | NO | Explicit counterexample retained. |
| The method is a learned neural operator. | Implementation is explicit harmonic coarse graining. | NO | Unsupported. |
| The method beats FNO/DeepONet or generalizes OOD. | Frozen v2 outcome is not yet run. | NO | Locked future experiment. |
| The method is novel relative to numerical upscaling literature. | Dedicated current novelty review not complete. | NO | Release blocker. |
