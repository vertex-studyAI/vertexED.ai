# Project2424: immutable baseline recovery and integrity

**Research-only archive branch. Do not merge this branch into VertexED `main`.**

This package recovers the exact committed 2026-08-30 registry snapshot and hardens
its validator. It does not restore portfolio code to the VertexED application,
change a research protocol, execute an experiment, or grant publication readiness.

## Source and scope

The original source is `vertex-studyAI/vertexED.ai` at commit
`016e1bdc1f6e38f80d7bbe8b596bcb5349fa0c0a`, previously retained by closed,
unmerged PR #601. The registry archive and summary are reused as the **original
Git blobs**, not regenerated or transcribed. See `SOURCE_PROVENANCE.json`.

The independent uncompressed CSV SHA-256 anchor is:

```
84066ec134c0f9c216e23f18e9765efa439bee7f6be46dd5d6d29e9178f926d7
```

The snapshot records 2,424 T identities, 24 historically source-backed entries,
5 historically evidence-audited entries, 19 awaiting full evidence audit, 2,400
source-unrecovered entries, and zero submission-ready entries. These are **dated
registry assertions**, not a fresh audit of the underlying experiments or proof
that the 24 source packages are included here. They are not included here.

## Run

Python 3.10 or newer; standard library only. No model, GPU, training dependency,
network request, or paid API is used by either command.

```bash
python3 -m unittest discover -s baseline -p 'test_*.py' -v
python3 baseline/validate_project2424_baseline.py
```

The CLI is read-only, prints JSON, and exits 1 for rejected input. The `--root`
argument selects a directory containing the archive and summary. There is **no
CLI override** for the pinned trust anchor. This verifies only the immutable
August snapshot; a later snapshot needs a separately reviewed provenance record.

## What changed

The archived checker compared the CSV only with a checksum in its mutable sibling
summary. The replacement additionally checks an independently pinned digest,
the exact ordered 31-column schema, complete unique ordered identities, nonblank
fields, namespace/crosswalk restrictions, historical dates, per-identity source
classifications, all five frozen verdicts, and typed row-derived summary totals
and histograms. It rejects duplicate JSON keys, non-finite JSON values, malformed
CSV/gzip, missing inputs, symlink inputs, and oversized inputs. Diagnostics are
bounded rather than growing without limit or crashing on a missing protected ID.

The local test suite uses explicitly labeled synthetic **software test fixtures**,
not research results. Test-only mock trust anchors are confined to the Python
unit-test process. The separate CI snapshot step uses the unmodified production
anchor and the original archived CSV and summary. A unit-test pass must never be
substituted for that integration check.

## Unchanged scientific boundaries

- T2424-0025 remains mechanism-non-unique; it is not a unique NGMT result.
- T2424-0027 v3 retains its failed real-encoder gate and is not reverted to pending.
- T2424-0037 retains the validation-dominant, typed-mechanism-falsified boundary.
- T2424-0050 remains HOLD / no auto-merge or deploy.
- T2424-1863 retains its frozen negative gate.

No P-to-T suffix matching, new experiments, rescue tuning, score updates, or
current source-presence assertions are introduced. A snapshot-integrity pass is
not independent experimental reproduction, novelty evidence, or scientific
completion. Later evidence must be reconciled separately without rewriting this
historical archive.

## Repository isolation

VertexED's current `VERTEXED_REPO_ISOLATION.md` records the owner-approved
September 9 removal of cross-project material. This standalone archive branch
preserves that separation. Its tree contains only this baseline package and a
bounded Python verification workflow, not VertexED runtime code or old research
workflows. Neither `main` nor the original archived commit is changed.
