# NeuroCAD learned direct-vs-IR v2 — freeze manifest

**Protocol:** `NEUROCAD-EXP-001 / learned-direct-vs-ir-v2`  
**Freeze date:** 2026-08-14  
**Outcome state:** `[EXPERIMENT NOT YET RUN]`

This manifest makes the pre-outcome degrees of freedom explicit. If any frozen item below changes after a model output is observed, the changed study must use a new protocol version.

## Frozen repository artifacts

- protocol: `../LEARNED_DIRECT_VS_IR_PROTOCOL_V2.md`
- benchmark generator: `build_learned_direct_vs_ir_v2.py`
- generated benchmark destination: `learned_direct_vs_ir_v2.json`
- expected generated benchmark SHA-256: `98f714fb1a1ed185f06e75f32d0e3aca9abfdc2aaf824937f708c20fe0c7ee87`
- IR system prompt: `v2_ir_system_prompt.txt`
- IR system prompt SHA-256: `867cebc9735ab5aee4d0c75b0834800dff49124d55be64c056f8fb0782acedd1`
- direct system prompt: `v2_direct_system_prompt.txt`
- direct system prompt SHA-256: `6219c616bbbf6500ed287bda31cc20358eb84abadaa265e5557834166d48eae6`

The prompt hashes include the final newline stored in each file.

## Frozen model identity

- Hugging Face repo: `Qwen/Qwen2.5-Coder-7B-Instruct-GGUF`
- repo revision: `13fb94bfda8c8cf22497dc57b78f391a9acb426a`
- quantization: `Q4_K_M`
- shard 1 SHA-256: `89f120544682078148c5a86117de9af3a65c339111262f2d3ff01d80d48b14be`
- shard 2 SHA-256: `0183b3c850cfa96c31082c3af0123115300d3f62798c4448fa8f57bd0eac05e0`

## Frozen inference budget

- same model and weights for both arms;
- same 48 user prompts, byte-identical between arms;
- temperature `0`;
- maximum output `384` tokens per case per arm;
- one call only;
- no retries;
- no execution feedback;
- no model-assisted repair;
- no few-shot examples;
- no tools/retrieval;
- no prompt tuning on v2 outcomes.

## Frozen decision rule

Primary metric: end-to-end successful cases / 48.

Typed IR advances only if:

1. `success(M1) - success(B1) >= 0.10`; and
2. valid-case executable semantic success for M1 is not lower than B1.

Report paired bootstrap 95% interval and discordant-case counts descriptively. Do not replace this practical-effect rule with a post-hoc significance criterion.

## Execution prerequisites — must be identity metadata, not tuning

Before first outcome generation, record:

- exact `llama.cpp` version and executable SHA-256;
- exact OpenSCAD version;
- machine/OS information;
- current Git commit SHA;
- SHA-256 of the protocol file;
- SHA-256 of the generated benchmark and verify it equals the expected value above;
- SHA-256 of both prompt files and verify they equal the values above;
- local weight hashes and verify they equal the values above.

Failure of any identity check blocks execution. It does not authorize substitution or threshold changes.

## Benchmark generation command

```bash
python3 portfolio/project2424/projects/T2424-0037/benchmark/build_learned_direct_vs_ir_v2.py
shasum -a 256 portfolio/project2424/projects/T2424-0037/benchmark/learned_direct_vs_ir_v2.json
```

Expected benchmark digest:

```text
98f714fb1a1ed185f06e75f32d0e3aca9abfdc2aaf824937f708c20fe0c7ee87
```

## Scientific boundary

This freeze does not claim a result exists. It closes `NEUROCAD-FREEZE-001` only when reviewed/merged as the immutable pre-outcome protocol. `NEUROCAD-EXP-001` remains a separate execution task.
