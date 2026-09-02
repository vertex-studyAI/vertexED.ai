# T2424-0025 Status

**Project:** Non-Gaussian Memory Transformer  
**Queue rank:** 18  
**Track:** C — Existing work → minimum experiment  
**State:** `MERGED / REPRODUCED_BOUNDED_ROBUST_READOUT_PRECURSOR / UNIQUE_NGMT_MECHANISM_NOT_ESTABLISHED`  
**Claim level:** synthetic robust memory-readout precursor evidence

## Identity / interpretation correction

The canonical queue identity is **Non-Gaussian Memory Transformer**, but the implementation under this T2424 package is a bounded deterministic robust-readout precursor, not a full learned Transformer mechanism.

A later separately frozen **NGMT v0.1** learned B0–B3 Transformer experiment exists in the broader research portfolio and has its own reproduced negative verdict. Do not merge the two evidence levels or use this precursor to overwrite the v0.1 result.

## Integrated evidence

- deterministic attention-addressed memory;
- weighted-mean baseline;
- weighted-median robust readout;
- Gaussian clean control;
- Cauchy-contaminated heavy-tail condition;
- 30-seed benchmark;
- 50-seed mean/median/trimmed/Huber contamination sweep;
- focused regression coverage;
- exact reruns retained in the Project2424 reproducibility wave.

The robust-readout ablation was integrated on current main by PR #271, merge commit `5ee79ab834dfb3d831d65d55a5b0eaeb2a68cf83`.

Fresh independent exact executions recorded in the reproducibility checkpoint include:

- 30-seed screen output SHA-256 `7b26bfcf82444b1de868092c8391a3772bd4e6acc5d64468839f9af6290a3db1` — byte-identical to retained Actions evidence;
- 50-seed robust-readout sweep SHA-256 `f61dd31562ce2f5638535a90ab2d700aed494790e9aca515797595158ee9ee4e` — byte-identical.

## Scientific interpretation

The package demonstrates robust-readout behavior on the controlled contamination construction.

However, the robust-readout advantage is also substantial at **0% contamination**. That negative control prevents attribution of the effect uniquely to a non-Gaussian memory mechanism.

Therefore the correct current interpretation is:

`REPRODUCED_BOUNDED_ROBUST_READOUT_PRECURSOR / UNIQUE_NGMT_ATTRIBUTION_REJECTED`

## Not claimed

- full Transformer architecture from this T2424 package;
- uniquely non-Gaussian memory advantage;
- learned attention robustness;
- long-context or language-model gains;
- real sequence-model performance;
- external validation;
- publication novelty;
- research completion.

## Successor boundary

Do not tune this precursor to manufacture a unique mechanism claim. Any successor requires a new frozen learned protocol. The existing NGMT v0.1 learned experiment remains frozen at its reproduced negative/inconclusive verdict and is not rescued by this precursor.
