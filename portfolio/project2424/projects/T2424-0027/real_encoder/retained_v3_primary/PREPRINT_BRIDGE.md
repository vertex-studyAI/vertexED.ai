# T2424-0027 v3 preprint bridge

Status: **READY_FOR_MANUSCRIPT_INTEGRATION / PRIMARY VERDICT FROZEN NEGATIVE**

This file is a publication-facing bridge for the already-retained primary v3 result. It does not modify the experiment, thresholds, seeds, controls, or verdict.

## Exact evidence identity

- Protocol: `T2424-0027-REAL-ENCODER-GATE-v3`
- Frozen preregistration commit: `a3fc8fb13c600ec5a7b5a3bc4379b88c80a11c7a`
- Frozen preregistration manifest blob: `3adc92ebf9203f20319582e33c98ba570f9d884c`
- One-shot trigger commit: `0e9d7c9ad4abd61b8996303fdcd45579b898f327`
- Primary GitHub Actions run: `33307308534`
- Primary job: `99246007605`
- Uploaded artifact: `9730910606`
- Uploaded ZIP SHA-256: `5bebd21c4e0b763a68c100c58bdea10d1822550d08fcda505ed65c84eb44a757`
- Retained `summary.json` SHA-256: `a85d3dc88fa733a9317557308da190f470d5515da10d9725716846ee92a10999`
- Retained `verdict.json` SHA-256: `657121323bef83cf9bbcd7f176259dd274b133e42bad05f276dfadc719b4a09e`
- Retained `per_seed_metrics.jsonl` SHA-256: `4fa50c475e02d3928753a4019f9c29eb964c033b12be6c448c24dd95eeacbae2`

## Result that may be reported

The frozen real-encoder successor **failed its preregistered primary success gate**. Mean raw locale/language probe accuracy was `0.49235555555555555`, below the frozen `>=0.75` prerequisite, and all five frozen seeds failed the conjunction (`0/5` passes versus `>=4/5` required).

The same execution descriptively retained a strong centering effect (`mean_effect_retention=0.8713252358181732`, `mean_normalized_language_leakage_reduction=0.8350200176590828`), minimal intent degradation (`mean_intent_drop=-0.002488888888888874`), and a positive specificity margin (`0.8168639008523437`). These secondary observations do **not** rescue the failed primary gate.

## Required manuscript wording boundary

The manuscript may state that the controlled synthetic predecessor passed its synthetic mechanics gate while the separately preregistered real-encoder v3 successor failed its own primary gate. The two results must remain distinct experiments with distinct evidentiary scopes.

The manuscript must not claim that v3 establishes linguistic relativity, cognition, translation quality, universal language-invariant representations, fine-tuned-model behavior, or superiority over matched learned baselines. It must not lower the raw-language threshold, change seeds, alter the intent universe, swap encoders/datasets, or reinterpret `0/5` as a partial pass.

## Publication-safe concise result

> In the frozen real-encoder successor, language-specific centering produced a substantial descriptive reduction in measured locale leakage while preserving intent structure, but the preregistered success conjunction failed because raw locale predictability never reached the required 0.75 floor on any of five fixed seeds (0/5 seed passes). We therefore report v3 as a negative primary result and treat any revised protocol as a new preregistration.

## Next publication gate

Integrate this negative successor result into the T2424-0027 manuscript as a separately labeled real-encoder experiment, then perform a sentence-level claim audit that checks every number and boundary against the retained primary artifact and checksum ledger.