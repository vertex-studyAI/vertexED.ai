# Research Reproducibility Wave — 2026-08-12

## Execution identity

- canonical base commit: `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`
- reproduction runner commit: `54baa1f21a3bc14adbf20eb604f356dfb926dac8`
- GitHub Actions run: `31616762393`
- result: `success`
- runner: Ubuntu x86_64, Node `v22.23.1`
- raw Actions artifact: `research-repro-wave-20260812`
- artifact digest: `sha256:77adb4c659a7e4bf4bd02c16122d20c92828bf73a36031790eed135bc3285e31`

The scientific implementations were not modified before the reproduction run. The runner commit adds only the workflow used to execute and retain the frozen experiments.

## T2424-0025 / NGMT precursor

The executable package remains a bounded attention-addressed memory aggregation screen, not a Transformer.

Fresh 30-seed screen:

- Cauchy condition mean-readout MAE: `0.3615267855`
- weighted-median MAE: `0.0165609423`
- relative improvement: `95.4192%`
- clean-control mean MAE: `0.0243549670`
- clean-control median MAE: `0.0125939627`
- clean-control improvement: `48.2900%`
- heavy-tail minus clean relative-improvement gap: `47.1292` percentage points

Fresh 50-seed fixed contamination sweep reproduced all six contamination rates. At the 18% condition, mean/median/trimmed/Huber MAE were `0.349439±0.347203`, `0.017003±0.004858`, `0.045506±0.015713`, and `0.030926±0.006796` respectively.

**Boundary:** the 0% control also strongly favors robust readouts (weighted median improves about 49% over the mean), so the present data support generic robust aggregation under the synthetic noisy-memory construction but do not cleanly isolate a uniquely non-Gaussian mechanism. No Transformer, learned-memory, language-model, novelty, or paper-readiness claim is authorized.

## T2424-0027 latent-language diagnostic

Fresh deterministic run and independent verifier passed.

- raw concept accuracy: `1.0000`
- raw language accuracy: `1.0000`
- language-centered concept accuracy: `1.0000`
- language-centered language accuracy: `0.361111`
- chance language accuracy: `0.333333`
- normalized language-leakage reduction: `0.958333`
- global-centering language accuracy: `1.0000`
- independent evidence consistency: `PASS`
- raw result SHA-256: `0eac35dd7b8af1488efab0392c2e82dab8f9a90332af7c6ad54633263fa13605`

**Boundary:** this reproduces a controlled synthetic factor-removal mechanism only. It is not evidence for linguistic relativity or real multilingual model behavior.

## T2424-0037 NeuroCAD

Fresh 20-case frozen grammar benchmark: `20/20` passed. Accepted cases matched the expected `15/15`; syntax/execution success, geometry validity, dimension accuracy, and constraint satisfaction were all `1.0`.

**Boundary:** deterministic single-family compiler mechanics only; no general NLP-to-CAD, learned parser, arbitrary engineering intent, or complex CAD-kernel validity claim.

## T2424-0050 Darcy

Fresh 20-seed bounded 1D screen:

- baseline pressure MAE: `0.0658913916`
- reduced-resistance pressure MAE: `0.0011366559`
- mean relative improvement: `97.8766%`
- mean flux relative error: `1.369e-16`
- max reduced pressure MAE: `0.0014613492`
- verdict: `PASS_BOUNDED_DARCY_LATENT_SCREEN`

**Boundary:** the harmonic block representation preserves integrated resistance by construction and the generator is block-aligned. This is not a learned operator result and does not establish performance against FNO, DeepONet, PINNs, finite-volume solvers, 2D/3D data, or real porous media.

## Portfolio-wide external reproductions completed in the same wave

- LAM-JEPA frozen ARC Protocol V3 full-controls workflow rerun succeeded at scientific SHA `760aa7f9a73a177d5ff4ba7eb470f7e68ace63cb`, run `31203337502`, attempt 2. The retained five-seed result remains negative/inconclusive for mechanism and superiority; locked test was not evaluated.
- Atlas V4 source archive SHA-256 `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c` was freshly rerun on CPU Linux / Python 3.13.5. `39/39` tests passed. APEN base + robustness, Eigen-JEPA, and NPMS reran without scientific-code changes.
- Across selected APEN/Eigen-JEPA/NPMS artifacts, `61/65` files matched byte-for-byte. The four mismatches were generated PDFs whose only observed difference was Matplotlib `CreationDate`; numerical CSV/JSON/NPZ and PNG outputs matched exactly.

## Promotion policy after this wave

A green reproduction promotes **execution confidence**, not scientific claim strength. Negative controls, losing baselines, mechanism failures, and scope boundaries remain part of the canonical result. No project here is promoted to `RESEARCH_COMPLETE` solely because the reproduction passed.
