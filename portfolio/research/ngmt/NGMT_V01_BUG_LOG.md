# NGMT v0.1 Bug / Invalid-Run Ledger

## Attempt 1 — invalid before scientific execution

**Actions run:** `31661146957`  
**Execution head:** `475fd26c568a71db8a82be87a1321fc1f06f9afd`  
**Frozen protocol arithmetic head recorded by workflow:** `8234b335c046b893fe241d25859f84a475ab907f`  
**Artifact:** `9166231239`  
**Artifact ZIP SHA-256:** `97b191ac1a8ba3de2776c07caa6e38b28a6cd77330e8af82e69802b82995c42a`

### What happened

Dependency installation and environment capture succeeded. The invariant-test step failed during pytest collection before any B0/B1/B2/B3 training or evaluation began.

Python 3.13.14 raised:

```text
AttributeError: 'NoneType' object has no attribute '__dict__'
```

inside `dataclasses._is_type` while decorating `MemoryState` in `v01/run.py`.

The immediate cause is the test loader in `tests/test_ngmt_v01.py`: it creates a module using `importlib.util.module_from_spec()` and executes it without first inserting that module into `sys.modules`. Python 3.13's dataclass implementation consults `sys.modules[cls.__module__]` during decoration, so collection fails even though direct execution of `run.py` does not use this loader path.

### Scientific classification

`INVALID_EXECUTION_PLUMBING_FAILURE_PRE_SCIENTIFIC_RUN`

No scientific result exists for attempt 1. The training step was skipped. No B0–B3 metric, comparison, gate outcome or NGMT mechanism conclusion may be inferred from this attempt.

### Allowed correction

Change only the test loader so the dynamically loaded module is registered in `sys.modules` before `exec_module`.

Do **not** change:

- any frozen protocol file;
- B0/B1/B2/B3 mechanism equations;
- sequence generators;
- data counts or seeds;
- Transformer architecture;
- optimizer/training budget;
- metric definitions;
- advancement thresholds;
- `v01/run.py` scientific implementation.

After the loader correction, rerun as a distinct attempt and retain attempt 1 permanently.
