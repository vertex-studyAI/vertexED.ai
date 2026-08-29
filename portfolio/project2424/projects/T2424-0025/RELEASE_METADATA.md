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

## Release checklist

- [x] frozen experiment/source identity documented;
- [x] synthetic-data statement documented;
- [x] external-validation non-claim documented;
- [ ] final authorship and contribution statement approved;
- [ ] code/release license approved and added;
- [ ] clean PDF compiled and visually audited;
- [ ] final claim audit re-run after PDF/title/caption edits.

`PREPRINT_READY` remains blocked while any unchecked item above is open.
