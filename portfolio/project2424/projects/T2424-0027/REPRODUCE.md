# Reproduce T2424-0027

Scientific implementation is deterministic; do not tune the generator or gates after observing the result.

## Environment used in the fresh wave

```text
commit=f439498fa6aaf86bb9c0cb37002fcfaa2156c925
node=v22.22.0
npm=10.9.4
kernel=Linux 6.17.0-1022-azure x86_64 GNU/Linux
cpu_count=4
```

## Commands

```bash
node portfolio/project2424/projects/T2424-0027/experiment/run.mjs /tmp/T2424-0027-results.json
node portfolio/project2424/projects/T2424-0027/reproduction/verify.mjs
node --test tests/project2424LatentLanguageAudit.test.mjs
sha256sum /tmp/T2424-0027-results.json
```

Fresh Actions evidence: run `31659677450`, artifact `project2424-research-repro-wave` / artifact id `9165714770`.

Expected raw-result SHA-256 for this wave:

```text
0eac35dd7b8af1488efab0392c2e82dab8f9a90332af7c6ad54633263fa13605
```

The verifier must recompute the retained metrics and gates and fail closed on claim/evidence inconsistency.
