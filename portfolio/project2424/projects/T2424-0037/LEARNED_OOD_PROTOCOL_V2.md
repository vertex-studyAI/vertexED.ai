# T2424-0037 NeuroCAD — Learned Direct-vs-Typed-IR OOD Protocol v2

**Protocol state:** `PREOUTPUT_FREEZE_INCOMPLETE_EXTERNAL_MODEL_LOCK`  
**Created:** 2026-08-14  
**Experiment ID:** `NEUROCAD-EXP-001-v2`  
**Parent evidence:** deterministic held-out-template v1 (`19/20` typed vs `12/20` direct overall; `12/12` valid cases executable as STL).  
**Integrity rule:** no model outputs from this experiment may be inspected until the provider/model/settings block and prompt-manifest hash are filled, committed, and independently reviewed.

## 1. Research question

Under a matched model/provider and generation budget, does forcing natural-language CAD requests through a typed, validated intermediate representation improve **end-to-end executable semantic success on previously unseen part families/compositions** relative to direct executable-code generation, constrained direct generation, and retrieval/template controls?

This is a new experiment. It does not alter, reinterpret, or repair the frozen v1 deterministic result.

## 2. Primary hypothesis

`H1`: On the frozen OOD benchmark, the typed-IR arm has higher end-to-end task success than the strongest direct-generation arm while remaining within the frozen generation-budget tolerance.

### Primary falsifier

The typed-IR hypothesis is **falsified for this protocol** if either:

1. its mean end-to-end task success does not exceed the strongest direct-generation arm by at least **10 percentage points**, or
2. any apparent advantage requires more than **1.25×** the median model-token budget or more than **1.25×** the median model-call count of the strongest direct arm, unless the direct arm itself invokes an equivalent repair/validation pass under the same allowance.

A baseline win or gate failure is preserved. Do not alter prompts, rubric, model, temperature, repair budget, success threshold, or primary metric after outputs are viewed.

## 3. Systems / arms

All learned arms must use the **same exact provider, model identifier/revision, decoding settings, system-level safety constraints, and maximum generation budget** unless a difference is intrinsic to the arm and explicitly declared below.

### M1 — Typed IR + validator + backend

1. model receives the natural-language request and the frozen typed-IR schema;
2. model emits only the typed IR;
3. deterministic validator checks schema, dimensions, constraints and supported operations;
4. deterministic compiler emits executable CAD source;
5. CAD kernel executes/reopens the generated artifact where supported.

No model repair call is allowed unless every learned arm receives the same frozen repair allowance.

### A1 — Typed IR minus semantic validator

Same model/schema as M1, but semantic safety/geometry validation is removed while syntax/schema parsing remains necessary to consume the output.

Purpose: isolate whether the validator rather than representation structure drives the result.

### B1 — Direct executable-code generation

The same model receives the natural-language request and a frozen backend/API specification and emits executable CAD code directly.

No typed intermediate representation is exposed.

### B2 — Constrained direct executable-code generation

Same model and target backend as B1, with a frozen structured-output/code skeleton or grammar constraint that does **not** reproduce the full typed-IR semantic validator.

Purpose: test whether generic output constraints, rather than the typed representation/validation mechanism, explain any benefit.

### B3 — Retrieval/template control

A deterministic or retrieval-assisted system selects from a frozen library of parametric templates and fills parameters without free-form learned geometry synthesis.

Purpose: test whether the benchmark is solvable by template matching rather than a learned representation mechanism.

### B4 — Existing deterministic v1 compiler

The current bounded rectangular-plate compiler is evaluated only on cases inside its declared support. It is a product/reliability reference, **not** a competitor on unsupported part families.

## 4. External model lock — MUST BE FILLED BEFORE FIRST OUTPUT

The experiment is not runnable until all fields below are concrete and committed.

- provider: `[EXTERNAL MODEL LOCK REQUIRED]`
- exact model identifier: `[EXTERNAL MODEL LOCK REQUIRED]`
- immutable revision/snapshot if provider exposes one: `[EXTERNAL MODEL LOCK REQUIRED OR EXPLICITLY UNAVAILABLE]`
- API/client version: `[EXTERNAL MODEL LOCK REQUIRED]`
- temperature: `[EXTERNAL MODEL LOCK REQUIRED]`
- top-p / top-k if applicable: `[EXTERNAL MODEL LOCK REQUIRED]`
- seed support and exact seed policy: `[EXTERNAL MODEL LOCK REQUIRED]`
- max output tokens: `[EXTERNAL MODEL LOCK REQUIRED]`
- max input/context tokens: `[EXTERNAL MODEL LOCK REQUIRED]`
- tool/function-calling configuration: `[EXTERNAL MODEL LOCK REQUIRED]`
- number of allowed generation calls per case: `[EXTERNAL MODEL LOCK REQUIRED]`
- repair/retry policy: `[EXTERNAL MODEL LOCK REQUIRED]`
- timeout policy: `[EXTERNAL MODEL LOCK REQUIRED]`
- pricing/cost accounting source and timestamp if paid: `[EXTERNAL MODEL LOCK REQUIRED]`

**Rule:** if deterministic seed control is unavailable, use the frozen repeated-sample policy in Section 8 rather than pretending outputs are deterministic.

## 5. Benchmark construction

### 5.1 Required families

The v2 benchmark must extend beyond the current rectangular-plate grammar. Include at least four parametric families chosen **before model outputs are generated**, for example:

- bracket with orthogonal flange;
- plate/panel with slots plus circular holes;
- stepped block or spacer with through-hole/counterbore;
- simple revolved part such as washer/bushing/flanged spacer;
- another family only if its ground-truth geometry and validity constraints can be evaluated automatically.

The exact selected families must be frozen in the manifest. Examples above are not permission to swap families after observing difficulty.

### 5.2 Case strata

The manifest must contain all of the following strata:

1. **IID-ish language / new instances:** familiar phrasing, unseen parameter combinations;
2. **linguistic OOD:** paraphrase, alternate ordering, units/abbreviations where supported;
3. **compositional OOD:** two or more valid operations/constraints combined in ways absent from demonstrations;
4. **family OOD:** part family absent from the original v1 plate benchmark;
5. **invalid/unsafe requests:** contradictory, missing, non-positive, impossible, unsupported or safety-envelope-violating specifications.

### 5.3 Minimum benchmark size

Freeze **at least 80 cases** before outputs:

- ≥ 50 valid cases;
- ≥ 20 invalid/fail-closed cases;
- ≥ 10 additional cases allocated to the hardest preregistered stratum.

No case may be removed because a system fails it. Any case later found objectively ambiguous must be retained and marked `AMBIGUOUS_PROTOCOL_DEFECT`; report metrics both with and without that case, with the all-cases result primary.

### 5.4 Authorship / leakage boundary

For every case record:

- author/source;
- creation timestamp;
- target family;
- target parameter JSON;
- intended validity;
- canonical semantic constraints;
- whether any wording/template appeared in model demonstrations, repository tests, README examples, or prompt engineering material.

Prefer an independently authored subset. If the method authors write the benchmark, state that limitation explicitly and require an external held-out set before broad publication claims.

## 6. Prompt-manifest freeze

Before first model output, commit machine-readable files:

- `benchmark/learned_ood_v2_cases.json`;
- `benchmark/learned_ood_v2_manifest.json`;
- exact prompt/system templates for M1/A1/B1/B2;
- retrieval/template library snapshot for B3;
- schema/backend API specification;
- evaluator version;
- kernel/backend version.

Record SHA-256 for every file in the experiment registry. Any modification after first output creates `v2.1+` and cannot replace v2.

## 7. Metrics

### 7.1 Primary metric — end-to-end task success

A **valid** case succeeds only if all required conditions pass:

1. parse/schema/code syntax succeeds;
2. CAD backend executes;
3. generated artifact is non-empty and can be reopened/parsed by the frozen checker where supported;
4. geometry/topology satisfies the ground-truth semantic constraints;
5. required dimensions/features are within frozen tolerance;
6. no extra prohibited geometry/features are present.

An **invalid** case succeeds only if the system rejects it before producing an artifact that the evaluator classifies as unsafe/semantically invalid.

`task_success = successful_cases / all_cases`.

### 7.2 Secondary metrics

Report by arm and by stratum:

- syntax/structured-output validity;
- CAD-kernel execution rate;
- reopen/editability rate where measurable;
- semantic constraint accuracy;
- dimension/parameter accuracy;
- topology/feature-count accuracy;
- invalid-request rejection rate;
- false rejection rate on valid requests;
- accepted-invalid rate;
- median and p90 model input/output tokens;
- model calls per case;
- wall-clock latency;
- estimated API cost when applicable;
- deterministic backend compile/runtime;
- coverage: fraction of cases the arm attempts rather than rejects.

### 7.3 Coverage-adjusted reliability

Because a validator may improve apparent correctness merely by rejecting difficult valid inputs, always report:

- valid-case success over **all valid inputs**;
- false-rejection rate;
- success conditional on acceptance;
- total coverage.

A method cannot claim superior general CAD ability from a higher conditional-success rate produced by sharply lower coverage.

## 8. Repeated-sample / seed policy

If the chosen provider exposes reproducible sampling seeds, freeze **5 seeds per case per learned arm** and pair seeds across arms.

If exact seed control is unavailable, freeze **5 independent samples per case per learned arm** with identical decoding settings and record provider request IDs/timestamps. Do not rerun failed samples except under the predeclared retry policy for transport/API errors.

Primary arm score is the mean case-level success across the five paired/repeated samples. Also report per-case failure frequency and arm-level uncertainty.

## 9. Statistics

For pairwise M1 vs strongest direct arm:

- preserve paired case structure;
- report absolute success-rate difference;
- report a paired bootstrap 95% confidence interval over cases;
- report McNemar-style paired success/failure analysis when assumptions are satisfied;
- report effect size and raw contingency counts;
- do not use significance as the sole promotion gate.

For stochastic repeated samples, use case as the primary resampling unit so repeated generations do not masquerade as independent benchmark cases.

## 10. Budget matching

Freeze before run:

- equal model family/revision across learned arms;
- equal maximum input/context budget except unavoidable schema/API text, which must be counted and reported;
- equal maximum output tokens;
- equal number of initial generation calls;
- equal repair/retry allowance;
- equal access to backend documentation/examples;
- equal evaluation timeout.

Report actual consumed tokens/calls. If M1 requires systematically more context because of the schema, that cost is part of the method and must not be hidden.

## 11. Error taxonomy

Every failed sample receives exactly one primary and any number of secondary tags:

- `PROMPT_MISINTERPRETATION`
- `SCHEMA_INVALID`
- `CODE_SYNTAX_INVALID`
- `BACKEND_EXECUTION_FAILURE`
- `KERNEL_INVALID_GEOMETRY`
- `TOPOLOGY_MISMATCH`
- `DIMENSION_MISMATCH`
- `MISSING_FEATURE`
- `EXTRA_FEATURE`
- `CONSTRAINT_VIOLATION`
- `UNSAFE_OR_INVALID_ACCEPTED`
- `VALID_INPUT_FALSE_REJECT`
- `UNSUPPORTED_FAMILY_REJECT`
- `RETRIEVAL_TEMPLATE_MISMATCH`
- `REPAIR_FAILED`
- `PROVIDER_TRANSPORT_FAILURE`
- `AMBIGUOUS_PROTOCOL_DEFECT`

The evaluator must not relabel failures in a way that changes the primary metric after inspecting aggregate results.

## 12. Ablation interpretation

- M1 > A1 isolates value consistent with semantic validation.
- M1 > B2 after matched budget supports value beyond generic constrained output.
- B3 matching M1 implies the benchmark may primarily test template selection/parameter filling.
- M1 advantage accompanied by major coverage loss weakens a broad representation claim.
- M1 advantage only on invalid rejection supports a reliability/safety contribution more than a generative-reasoning contribution.

No single ablation proves causality; conclusions remain bounded to the frozen benchmark.

## 13. Promotion / downgrade rules

### Promote toward research paper only if all hold

1. primary M1 vs strongest direct-arm delta ≥ `+0.10`;
2. paired interval/effect does not indicate the advantage is driven by a tiny number of cases;
3. M1 does not violate the 1.25× budget guardrail;
4. valid-input false-rejection rate is not more than 5 percentage points worse than strongest direct arm;
5. advantage appears in at least **two preregistered OOD strata**, not only invalid rejection;
6. B3 retrieval/template control does not explain the whole effect;
7. evaluator and artifact provenance are complete.

### Downgrade to product/reliability contribution if

- gains are concentrated in invalid rejection or deterministic validation;
- learned direct generation matches semantic success on valid OOD cases;
- typed IR is useful operationally but not scientifically distinct after budget matching.

### Negative result if

- primary falsifier triggers;
- strongest direct/constrained/retrieval baseline matches or beats M1;
- coverage/budget confound explains the observed advantage.

Preserve the result. Do not tune v2 after seeing it.

## 14. Evidence contract

Retain:

- immutable source commit;
- this protocol hash;
- completed model-lock block;
- benchmark/manifest hashes;
- exact prompt templates;
- every raw model response;
- provider request IDs and timestamps where available;
- parsed IR/code;
- validator output;
- CAD source and generated artifacts;
- kernel/reopen logs;
- per-case evaluator record;
- aggregate metrics + uncertainty;
- token/call/cost accounting;
- environment versions;
- independent recomputation output;
- all failed/transport runs.

## 15. Current blocker and authorization boundary

**No learned run is authorized yet.** The protocol design is frozen, but the experiment remains blocked until:

1. a concrete provider/model/revision/settings block is committed;
2. the ≥80-case machine-readable benchmark and prompt manifest are authored and hashed;
3. a skeptical reviewer checks leakage, budget matching, metric definitions and falsifier **before any model output is viewed**.

Until those three conditions hold, the only legitimate current NeuroCAD claim remains the bounded deterministic v1 result and executable plate-family backend evidence.