# NGMT v0.1 Bug / Invalid-Run Ledger

## Root execution-plumbing bug

The frozen scientific implementation was not changed by this bug/fix lineage. Both invalid attempts below failed during pytest collection before B0/B1/B2/B3 scientific training.

Python 3.13.14 raised:

```text
AttributeError: 'NoneType' object has no attribute '__dict__'
```

inside `dataclasses._is_type` while decorating `MemoryState` in `v01/run.py`.

The cause was the dynamic loader in `tests/test_ngmt_v01.py`: it created a module with `importlib.util.module_from_spec()` and executed it without first inserting that module into `sys.modules`. Python 3.13 dataclass decoration consults `sys.modules[cls.__module__]`.

Scientific classification for both attempts:

`INVALID_EXECUTION_PLUMBING_FAILURE_PRE_SCIENTIFIC_RUN`

No scientific result, B0–B3 comparison, gate outcome or mechanism conclusion is inferred from either invalid attempt.

## Attempt 1

**Actions run:** `31661146957`  
**Execution head:** `475fd26c568a71db8a82be87a1321fc1f06f9afd`  
**Frozen protocol arithmetic head recorded by workflow:** `8234b335c046b893fe241d25859f84a475ab907f`  
**Artifact:** `9166231239`  
**Artifact ZIP SHA-256:** `97b191ac1a8ba3de2776c07caa6e38b28a6cd77330e8af82e69802b82995c42a`

Dependency installation and environment capture succeeded; invariant-test collection failed; scientific execution was skipped.

## Attempt 2

**Actions run:** `31661294502`  
**Execution head:** `0adfd94f39b90f404591b762de29ae531ace3c5b`  
**Artifact:** `9166281624`  
**Artifact ZIP SHA-256:** `211bde0ca19f79b338b1b166c4a79654ae728bf03357d93a3c42f1fd00a635d5`

Attempt 2 was triggered by committing this bug ledger while the workflow still used the broad `NGMT_V01_*.md` path filter. The same unfixed test-loader error reproduced before training. It is retained separately rather than hidden or treated as scientific replication.

## Correction

Commit:

```text
385ea6251561ed2a7b05b6a6f10307666b169b80
```

changed only the test loader to register the dynamically loaded module in `sys.modules` before `exec_module`.

The correction did **not** change:

- any frozen protocol file;
- B0/B1/B2/B3 mechanism equations;
- sequence generators;
- data counts or seeds;
- Transformer architecture;
- optimizer/training budget;
- metric definitions;
- advancement thresholds;
- `v01/run.py` scientific implementation.

The next run, `31661313386`, passed the invariants and executed the complete scientific protocol, producing the retained negative/inconclusive result.

## Workflow-trigger hardening after the result

After the valid result was observed, the workflow path filter was narrowed so result/bug documentation cannot silently retrigger scientific experiments. Only the exact four frozen protocol files, v0.1 implementation, invariant test, workflow file, or manual dispatch can now trigger a rerun.

This is execution plumbing only. It does not modify the frozen scientific protocol or result.
