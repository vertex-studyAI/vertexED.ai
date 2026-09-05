# T2424-0025 Release Metadata Gate

Status: **PARTIALLY RESOLVED / RELEASE BLOCKED**

This file separates facts already supported by repository evidence from release metadata that still requires an explicit human decision. It does not change the scientific result.

## Code identity — resolved

The frozen precursor implementation and exact reproduction commands are retained under this project directory. Independent reproduction is anchored by PR #311 / merge `715aea0b632c70493c226a84473d77ff7ca8cfc6`, with reproduced output digests retained in `PREPRINT_READINESS.md` and `REPRODUCE.md`.

## Data statement — resolved for the precursor

The current study does not use an external human-subject, proprietary, or downloaded benchmark dataset. Experimental observations are generated synthetically by the frozen project code from the deterministic signal/noise procedure documented in the project package.

The manuscript may state that the precursor uses synthetic generated data and should point readers to the exact frozen generator/source lineage. It should not imply that a real-world dataset was evaluated.

## External-validation statement — resolved

No external validation is established by this precursor. Independent reproduction of the same frozen experiment is reproducibility evidence, not independent dataset/domain validation.

## Authorship / contributions — OPEN

The repository does not provide enough evidence in this package to assign a final paper author list or contribution taxonomy automatically.

Before release, an authorized human must explicitly approve:

- final author names and order;
- contribution roles;
- corresponding-author/contact metadata where required by the venue;
- acknowledgements/funding disclosures if applicable.

Do not infer authorship from commit history alone.

## License / release rights — OPEN

No repository-root `LICENSE` file was present when this gate was audited. Therefore code-release licensing must not be invented or implied.

Before public preprint/code release, explicitly determine and record:

- license for the project code;
- license/reuse status for any third-party material included in the release;
- whether the chosen venue or archive imposes additional distribution terms.

Until that decision is recorded, the paper may describe reproducibility commands but should not claim a specific open-source license.

## Verified PDF artifact

The deterministic seven-page A4 PDF from workflow run `33409968826` has SHA-256 `6cb16ac5662b7fadbf06c50e14174d190693fe22e56023cd8c0d106646b3722c` and byte length `155174`. It is unencrypted, contains no JavaScript, and has normalized metadata dates. All pages were visually inspected.

Artifact `9764731032` expires on 2026-09-30. It is temporary workflow evidence and must not be represented as a permanent archive. Exact evidence and repository-file identities are retained in `RELEASE_MANIFEST.json`.

## Release checklist

- [x] frozen experiment/source identity documented;
- [x] synthetic-data statement documented;
- [x] external-validation non-claim documented;
- [ ] final authorship and contribution statement approved;
- [ ] code/release license approved and added;
- [x] clean PDF compiled and visually audited;
- [x] final claim audit re-run after PDF/title/caption edits;
- [ ] exact digest-bound package placed in an authorized permanent archive.

`PREPRINT_READY` remains blocked while any unchecked item above is open.
