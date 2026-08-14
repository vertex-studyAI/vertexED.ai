# T2424-0037 / NeuroCAD — DECISIVE ADVANCEMENT PROTOCOL

**Protocol date:** 2026-08-14  
**Parent evidence:** held-out linguistic-template protocol v1 + real OpenSCAD execution.  
**Parent result:** typed/validated `19/20` overall vs direct flat extraction `12/20`; valid CAD kernel execution `12/12`; v1 adverse case O018 preserved.  
**Rule:** parent evidence is immutable. This protocol cannot be used to rewrite the v1 result.

## Why this protocol exists

The current result establishes a bounded advantage for a typed/validated **rectangular-plate** compiler over a deliberately simple flat-regex baseline. That is useful engineering evidence, but it does not establish either of the two research claims that would make NeuroCAD substantially stronger:

1. typed/validated intermediate representation improves correctness relative to a **competent learned direct-generation baseline** under a fair model budget;
2. a typed CAD representation can generalize compositionally beyond one hard-coded part family.

These require different experiments and must not be conflated.

---

# EXPERIMENT A — SAME-MODEL LEARNED DIRECT GENERATION vs TYPED IR

## A1. Scientific question

When the **same fixed language model/provider, prompt budget, decoding budget and CAD backend** are used, does generating a typed validated CAD IR before executable code improve end-to-end task correctness and fail-closed behavior over direct executable CAD generation?

## A2. Hypothesis

On a frozen mixed valid/invalid CAD-prompt benchmark inside the **same declared geometry scope**, the typed-IR route will:

- improve end-to-end valid-task success;
- improve invalid-request rejection / fail-closed behavior;
- reduce syntactically valid but geometrically/semantically wrong executable outputs;
- do so without an unacceptable compute/cost multiplier.

## A3. Mechanism under test

The causal candidate is **typed constrained intermediate representation + explicit validation before code generation**, not the language model itself.

Both systems must use the same model and comparable instructions/budget:

### M1 — model → typed IR → deterministic validator/compiler

1. fixed model reads prompt;
2. model emits only the frozen typed IR schema;
3. schema validation + geometry/safety validation run deterministically;
4. deterministic compiler emits OpenSCAD;
5. OpenSCAD executes to STL.

### B1 — same model → direct OpenSCAD

1. exact same fixed model/provider reads the same prompt;
2. model emits OpenSCAD directly under a prompt matched for task information but without access to the typed validator/compiler path;
3. output is executed by the same OpenSCAD version and resource limits.

### B0 — existing deterministic flat extractor

Retain the historical flat-regex baseline as a low-complexity reference, but **B1 is the dangerous baseline** for any learned-system claim.

## A4. Execution authorization status

`BLOCKED_EXTERNAL_MODEL_ID — NOT YET EXECUTION-FROZEN`

This experiment must **not run** until the following fields are committed in a versioned protocol amendment **before any benchmark outputs are observed**:

- provider;
- exact model identifier and immutable revision/version where the provider exposes one;
- API/runtime version;
- temperature/top-p/seed or provider-equivalent decoding controls;
- max output tokens;
- retry policy;
- system/user prompts for M1 and B1;
- tool access, if any;
- per-case call budget;
- timeout;
- price/accounting source if cost is reported.

No provider/model is invented in this file. If the provider cannot expose a sufficiently stable model identity, the run can still be engineering characterization but cannot support a strong reproducibility claim.

## A5. Benchmark rule

Do **not** reuse the 20-case v1 set as the only evaluation set, because it has already been observed during method development.

Before execution, freeze a new benchmark containing:

- valid prompts inside the declared supported families;
- invalid dimensions;
- impossible/unsafe geometry;
- unsupported requests;
- paraphrase/template variation;
- multi-constraint prompts;
- adversarially ambiguous prompts where rejection is acceptable/preferred.

The benchmark constructor may inspect the **capability specification**, but may not inspect M1/B1 outputs before cases and labels are frozen.

If a hidden independently authored set is available, prefer it.

## A6. Primary metrics

Report per case and aggregate:

1. **Executable success** — output compiles/renders under the frozen CAD backend;
2. **Geometry validity** — no self-evident invalid dimensions/topology under the frozen checker;
3. **Semantic/task accuracy** — frozen target constraints are satisfied;
4. **Invalid-request rejection accuracy**;
5. **overall task success** — valid case succeeds only if executable + geometrically valid + semantically correct; invalid case succeeds only if safely rejected;
6. **unsafe acceptance rate**;
7. **syntax-only false success** — executable but semantically wrong;
8. **runtime and model-call latency**;
9. **input/output token count and monetary cost** when available;
10. **retry frequency**.

## A7. Primary effect statistic

`delta_overall = overall_success(M1) - overall_success(B1)`.

Secondary effects:

- `delta_invalid_rejection`;
- `delta_valid_semantic_success`;
- `delta_unsafe_acceptance`;
- cost/runtime ratio.

If outputs are stochastic, use paired repeated generations per prompt under a frozen repeat/seed policy and report uncertainty. Do not choose the best generation from multiple retries unless the same frozen policy applies to both arms.

## A8. Advancement criterion

This exact numerical gate is intentionally **not yet frozen** because benchmark size/model stochasticity have not yet been specified. The protocol amendment that freezes the benchmark and model must simultaneously freeze:

- minimum practically meaningful `delta_overall`;
- uncertainty rule;
- maximum tolerated unsafe-acceptance rate;
- maximum accepted compute/cost multiplier.

That amendment must be committed **before** execution. Results cannot be used to choose these thresholds.

## A9. Falsifier

A strong typed-IR superiority claim is defeated if the same-model direct generator:

- matches or exceeds M1 on overall end-to-end success within the frozen practical-equivalence boundary; or
- achieves comparable validity/rejection without the typed IR; or
- M1's gain is explained by materially larger prompt/tool/retry budget; or
- M1 still accepts unsafe/invalid outputs above the frozen safety boundary.

A negative result is retained.

---

# EXPERIMENT B — STRUCTURAL PART-FAMILY OOD

## B1. Current-state blocker

**Do not run a “new part-family OOD” benchmark against the current v1 method.**

The current implementation is explicitly plate-specific:

- parser requires `plate|panel|bracket|rectangle` language and extracts width/height/thickness plus circular holes;
- IR type is literally `rectangular_plate`;
- deterministic compiler emits a plate body and circular-hole subtraction only.

Testing an unseen geometry family such as a shaft, flange, angle bracket, enclosure, stepped block or slotted profile against this exact method would simply measure an already-known unsupported scope. It would not be a fair test of representation generalization.

Therefore structural OOD is blocked on a **new versioned multi-family mechanism**, not on more prompts.

## B2. Required v2 mechanism before OOD

NeuroCAD v2 may enter structural OOD only after its representation is generalized from one hard-coded part type to reusable geometry/constraint primitives. At minimum the v2 design must define:

- reusable primitive/feature vocabulary;
- typed dimensions and units;
- positive/negative constraints;
- composition/boolean operations;
- feature placement/reference semantics;
- deterministic validation rules independent of individual wording;
- executable compiler backend;
- explicit unsupported-feature rejection.

A parser that merely adds one `if/regex` branch per benchmark family is **not sufficient** to claim compositional representation generalization.

## B3. Freeze-before-build family split

Before implementing v2 against benchmark examples, commit a family split with roles:

- **development families:** used to implement/debug the generic representation and compiler;
- **validation families:** used for bounded model/schema selection;
- **held-out structural family/families:** names/specifications visible only at the capability-definition level necessary to define the task, but **individual test cases and target geometries must be frozen before evaluation and not used to patch v2**.

Prefer an independently authored hidden case set for the held-out family.

### Family design principles

The split must vary **construction structure**, not only nouns or phrasing. Candidate dimensions include:

- additive vs subtractive features;
- single vs multiple reference frames;
- holes vs slots/pockets;
- repeated patterns;
- orthogonal extrusions;
- symmetry/mirroring;
- parameter dependencies;
- placement constraints.

Do not declare a specific held-out family here if its case set is not yet independently frozen; doing so would invite implementation against the test.

## B4. Systems

At minimum compare:

- **M2:** NeuroCAD v2 generic typed IR + validator + deterministic compiler;
- **B1:** same-model direct executable CAD generation under Experiment A controls;
- **B2:** retrieval/template baseline using the closest development-family construction where feasible;
- **B3:** constrained direct generation / grammar or schema baseline if it can express the same feature vocabulary without the claimed intermediate mechanism.

A weak flat-regex plate extractor is not an adequate dangerous baseline for structural OOD.

## B5. Structural-OOD metrics

For held-out families report:

1. syntax/parse validity;
2. executable CAD success;
3. geometry/topology validity;
4. exact/constraint-level semantic accuracy;
5. invalid-request rejection;
6. feature-count/feature-type correctness;
7. dimension/placement accuracy;
8. reopen/editability where the backend permits it;
9. complexity scaling by number of requested features/constraints;
10. failure taxonomy;
11. runtime/cost/parameter accounting.

If STEP/B-rep is not produced, do not call STL/OpenSCAD output fully editable parametric CAD.

## B6. Falsifier

The representation-generalization claim is defeated if:

- success collapses on structurally held-out families while direct/retrieval/constrained baselines remain competitive;
- v2 requires benchmark-specific parser/compiler patches after seeing held-out failures;
- outputs execute but systematically violate target constraints;
- claimed editability is not preserved by the chosen artifact representation;
- improvement is attributable to greater model/tool/retry budget rather than the typed representation.

## B7. State

`BLOCKED_ON_V2_MECHANISM_AND_INDEPENDENT_HELDOUT_SET`.

This is a **scientific blocker, not an invitation to generate hundreds of CAD project variants**.

---

# ABLATION ATTACK FOR ANY SURVIVING v2

If Experiment A or B produces a positive result, run these before a mechanism claim:

1. **No semantic validation:** typed schema but skip geometry/safety validation.
2. **No typing:** same model emits untyped JSON/free-form fields compiled with permissive defaults.
3. **No deterministic compiler:** typed representation but model generates final code from it.
4. **Schema-only constrained generation:** same schema grammar without the claimed semantic validator.
5. **Capacity/call matched control:** ensure model calls/tokens/retries are matched.
6. **Corrupted-IR diagnostic:** perturb dimensions/feature references to test whether validator catches structural errors.
7. **Validator oracle diagnostic:** feed gold IR through compiler/validator to separate language-to-IR errors from geometry/compiler errors.

The smallest surviving component, not the full pipeline name, receives the mechanism credit.

# STATISTICAL / REPORTING RULE

- deterministic cases: report exact counts/rates and bootstrap/intervals only when justified by the case-sampling interpretation;
- stochastic model outputs: pair by prompt and repeat index; report seed/repeat policy and uncertainty;
- never choose favorable prompts or generations after observation;
- preserve every failure output;
- no `SOTA`, arbitrary CAD, manufacturing, or general NLP-to-CAD claim from this program without external benchmark evidence.

# NEXT STATE

1. Parent v1 remains **GREEN — bounded controlled evidence**.
2. Experiment A is **BLOCKED_EXTERNAL_MODEL_ID / BENCHMARK FREEZE REQUIRED** before execution.
3. Experiment B is **BLOCKED_ON_V2_GENERIC_MECHANISM + INDEPENDENT HELD-OUT FAMILY SET**.
4. No new NeuroCAD scientific compute should run until one of these blockers is resolved precisely.
