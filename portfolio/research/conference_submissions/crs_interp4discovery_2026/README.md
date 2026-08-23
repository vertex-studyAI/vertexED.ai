# CRS → NeurIPS 2026 Interpretability for Discovery

## Current state

`WORKSHOP_PACKAGE_IN_REVIEW` — not submitted.

The live workshop CFP was verified on 2026-08-23:

- deadline: 2026-08-29 23:59 AoE;
- up to 5 pages of main text; references and appendices excluded;
- NeurIPS 2026 workshop LaTeX template;
- double-blind and fully anonymized;
- non-archival / private during review;
- failure cases and negative results explicitly welcome;
- short responsible-use statement is mandatory.

## Evidence replay

The recovered V4 Research Atlas release source was replayed before this workshop rewrite.

- full Atlas test gate: 39/39 passing;
- 30-seed CRS aggregate: OOD task accuracy 0.886481, concept probe accuracy 0.499259, erasure 0.984296;
- pair-noise stress ladder reproduced through noise 1.20, where linear concept accuracy rises to 0.787315 and nonlinear concept accuracy to 0.570926;
- paper claims deliberately remain synthetic/controlled.

## Workshop rewrite

`paper.tex` is intentionally different from the older preprint:

- removes author/organization identity;
- uses `dblblindworkshop` mode;
- narrows the claim to a controlled intervention mechanism;
- promotes pair-mismatch leakage to a central negative result;
- adds the required responsible-use statement;
- does not claim causal fairness, real-domain discovery, nonlinear concept removal, SOTA performance, or external validation.

## Remaining release gates

1. Compile with the official 2026 style ZIP and confirm main text ≤5 pages.
2. Search compiled source/package for contributor names, affiliations, GitHub/Hugging Face usernames, and organization identifiers.
3. Independent human scientific review.
4. Upload the anonymous supplement and paper through OpenReview; capture the submission ID/receipt.

No package is `SUBMITTED` until the OpenReview receipt exists.
