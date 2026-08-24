# PEN Source/Evidence Recovery Ledger — 24 August 2026

## Recovery classification

`SOURCE_IDENTITY_SUBSTANTIALLY_RECOVERED / SOURCE_BYTES_NOT_YET_MATERIALIZED`

This is stronger than the earlier `FRESH_REPRODUCTION_BLOCKED_SOURCE_TREE` state, but it is **not** a fresh reproduction. The user Library contains a detailed `MODEL-PEN` handoff and a 141-file `WORKSPACE_STATE.json` hash ledger for the prior `/mnt/data/typhon-omega/projects/MODEL-PEN` workspace. The actual 141 project files have not yet been materialized into the current canonical Git workspace during this recovery pass.

## Project identity

- Project: **Predictive Engram Networks (PEN)**
- historical project ID: `MODEL-PEN`
- historical workspace: `/mnt/data/typhon-omega/projects/MODEL-PEN`
- historical Git state: no Git repository mounted
- evidence class: synthetic controlled for the compact experiments
- canonical numeric Project 2424 identity: unresolved in the historical handoff; do not infer one by suffix

## Recovered workspace hashes

From retained `WORKSPACE_STATE.json`:

- captured UTC: `2026-07-26T09:09:15.663397+00:00`
- Git commit: `null`
- core experiment code SHA-256: `d000011b780cbfeaa04980034fa84c0d61b38531a7207eb37f8f00cdd3ae9e0b`
- project-tree SHA-256 excluding the workspace manifest: `818c82f79c6a94923a81b14f303b149ff7f39c935cab73b1ba24e8c714c184cd`
- file count: `141`

Selected recovered file identities:

| Path | SHA-256 |
|---|---|
| `Makefile` | `99ab596f0b872124dd840fcff76ab3befe0102b5b92c725f2ea2250e9ce52ea4` |
| `PROJECT_MANIFEST.json` | `02387212092808bd0cfddfcf355743467e5cf32f609281c5232481bedd6fbf1a` |
| `README.md` | `6f5b71fcc1ce7995ee580909d328e35873417060976d81fd478276033f4bae13` |
| `baselines/contracts.json` | `7c02968cd7ce79e9ba60512771adfbaf742944fc9e26a6dd32517905ad3b4acc` |
| `benchmarks/protocol.json` | `2d059ce2576d540ac06c62c1f23e877d37f620766c8539114e4c2a708b48aa18` |
| `configs/compact.json` | `872721db5863bf82c67475a10ba10cccb9a5772500dc4676cef45c7b396a6e1b` |
| `configs/full.json` | `a7481b93e706e082bfc133bed4fed94d6bfe99e231ff9299c2ab028a211a5d15` |
| `src/pen/config.py` | `ac36f02ed10f77aff53d1316a5034c048a1bfd21ddf9c9475d80e05b2d830a88` |
| `src/pen/data.py` | `950c864592ab08348485f824a537c4fa5346c29091ed7edfbbcb1bb5edca84ed` |
| `src/pen/evidence.py` | `6916d405663af12622ca97686798c4500e76bb80d43a1fd6f20873da0b887188` |
| `src/pen/experiment.py` | `813d3e4e51f15889c0ed1e984c4cb31ecbd47a5f5260c77b1660b597d1ff7e91` |
| `src/pen/metrics.py` | `42a7651917c6692c5dedeec62811e0af36141428949635f595f0a4d1a26fbd5d` |
| `src/pen/model.py` | `bd9c275494fa8e3959cf25547d802af85a595d035878e283543cf83d217335b6` |
| `tests/test_config.py` | `44d954ff02bbd495e3ac0beee6e4e4b228eb20f72c80dc253c52557c50dc1d1e` |
| `tests/test_data.py` | `396b0d4d2d53e58aa05336bb269c0e04c606988ece336c4a8b4058384a511870` |
| `tests/test_model.py` | `5804734532d786cf1e106742d87eeea9fac114a7e7bff407783dece17075df73` |
| `tests/test_training.py` | `2c7190bfe755715d8fcaa053edfd79d4820826886cd48e6aaf5158e83e458440` |

These hashes are recovery targets. A future materialization is accepted as the same historical workspace only if the recovered files satisfy the retained hash ledger; do not silently reconstruct and call the result byte-identical.

## Recovered package composition

The retained handoff says the historical package contained:

- source;
- tests;
- configs;
- experiments;
- datasets;
- baselines;
- benchmark protocol;
- evidence;
- results;
- reports;
- documentation;
- manuscript;
- bibliography;
- claim-evidence matrix.

The implementation was an explicit bounded external-memory system with encoder/predictor, engram key/value bank, learned salience/write gate, retention decay, content retrieval, retrieval-utility trace, capacity control, utility-aware overwrite protection, source-time tracking and interference metrics. “Engram” was operational terminology, not a biological-equivalence claim.

## Recovered validation commands

Historical local integrity gate:

```bash
cd /mnt/data/typhon-omega/projects/MODEL-PEN
make test && make paper-check
```

Retained handoff records:

- `make test` → **6 passed**
- `make paper-check` → **passed**, 5,046 words and 14 claim records
- placeholder scan: no forbidden placeholders
- embedded credential assignment scan: none found

Historical smoke:

```bash
PYTHONPATH=src python3 experiments/run.py \
  --config configs/smoke.json \
  --experiment-id smoke-pen-v2-seed7
```

Historical compact experiment family includes:

```bash
PYTHONPATH=src python3 experiments/run.py \
  --config configs/compact.json \
  --experiment-id compact-pen-v2-seed17

PYTHONPATH=src python3 experiments/ablations.py \
  --config configs/compact.json
```

Main compact seeds: `17, 23, 29`.

Dataset identity: `pen-delayed-event-dynamics-v1` version `1.0.0`, class `SYNTHETIC_CONTROLLED`.

## Retained result boundary

The historical compact result is negative/mixed:

- PEN mean predictive MSE: `0.2382847617`
- no-memory: `0.2414076626`
- random-write: `0.2373956343`
- attention-only: `0.2357257257`
- PEN mean causal-event MSE: `2.6002264818`
- retrieval precision: `0.0630441904`
- memory utilisation: `0.84375`
- interference rate: `0.6666666865`

Therefore PEN slightly beats no-memory on the retained compact mean but does not beat random-write or attention-only. Learned-salience superiority is unsupported.

The first compact run where salience/write collapsed to zero is preserved as an invalidated implementation diagnostic rather than deleted.

## Claim-evidence recovery

A retained claim-evidence matrix explicitly supports implementation/synthetic claims while rejecting or withholding stronger claims. In particular:

- explicit-memory implementation behavior: supported by code/tests;
- delayed-event generator causal source indices: supported in the synthetic environment;
- repaired three-seed compact metrics: synthetic controlled;
- attention-only outperforming PEN across paired compact seeds: supported;
- novelty relative to external-memory literature: **rejected/unverified**;
- improvement on real scientific sequence modelling: **not executed**;
- biological-engram claim: **rejected**.

## Remaining blockers

1. materialize the actual historical project file bytes or an archive that reproduces the retained 141-file hash ledger;
2. resolve canonical long-term repository/path and lineage without inventing a Git commit that never existed;
3. run `make test && make paper-check` from a clean extracted/materialized package;
4. verify source files against `WORKSPACE_STATE.json` before calling it a fresh source recovery;
5. retain the negative compact conclusion;
6. independent citation/manuscript/code/reproduction audits remain outstanding;
7. no real-domain dataset result exists yet.

## Next safe action

Search the Library/local retained artifacts specifically for the historical `typhon-omega` convergence/archive payload containing `projects/MODEL-PEN/`. If found, materialize it, extract to an isolated recovery directory, verify the project-tree/file hashes, then run **tests and paper-check only first**. Do not launch a new scientific repair/outcome in the same recovery step.

## Current verdict

`SOURCE_IDENTITY_SUBSTANTIALLY_RECOVERED / SOURCE_BYTES_NOT_YET_MATERIALIZED / RETAINED_NEGATIVE_COMPACT_EVIDENCE`
