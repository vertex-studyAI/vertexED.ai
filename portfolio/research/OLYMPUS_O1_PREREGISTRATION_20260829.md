# Olympus O1 preregistration — controlled learned baseline

Date: 2026-08-29
Status: preregistration only; no outcome run has been executed by this artifact.
Canonical maturity source: `portfolio/research/OLYMPUS_ROADMAP.md`.

## Scientific question

Does explicit hypothesis → falsification → execution decomposition improve reliable task completion over a monolithic agent when the same learned provider, task set, context/tool access and budget are used?

## Frozen arms

A. Monolithic agent.
B. Full Olympus: Prometheus → Perseus → Hermes.
C. Olympus without Perseus.
D. Olympus without evidence enforcement.

Atlas and Kronos are not promoted as learned-model claims by this protocol. Their runtime roles may be instrumented, but any distinct learned-component claim requires separate evidence.

## Task-set freeze

- Target: 100 paired tasks.
- Minimum: two task families, 50 tasks per family.
- Every task row must have a stable `task_id`, family, exact input, success rubric, allowed tools and evidence requirements before any arm is run.
- The same task rows and ordering must be used across all four arms.
- No task may be added, removed or rewritten after seeing arm outcomes. Corrections require a new protocol version and a full rerun.

## Provider and execution freeze

Before the first scored task, record:

- provider/model exact identifier and version;
- temperature / sampling controls;
- system prompt template hashes;
- tool allowlist;
- maximum wall-clock time per task;
- maximum tokens per task;
- retry policy;
- machine/runtime identity sufficient to reproduce peak-RAM measurements.

No arm may receive a larger context, tool surface, retry count, token ceiling or wall-clock allowance.

## Primary metrics

Per task retain:

- `reliable_completion` (0/1);
- `schema_valid` (0/1 where applicable);
- `unsupported_or_incorrect_claim` (0/1);
- `falsification_caught` (0/1 where an injected/detectable false path exists);
- `tool_execution_correct` (0/1 where tools are required);
- `evidence_complete` (0/1);
- latency seconds;
- input/output/total token use where provider reports it;
- peak RAM bytes.

The primary endpoint is paired reliable-completion difference: Full Olympus minus Monolithic.

## Frozen promotion gates

These reproduce the existing roadmap and may not be relaxed after results are observed:

1. Full Olympus promotes only if paired reliable completion improves by at least 5 percentage points and the paired-bootstrap 95% CI lower bound is above zero.
2. Perseus remains distinct only if falsification catch rate improves by at least 5 points without reducing reliable completion.
3. Evidence enforcement remains distinct only if unsupported/incorrect claims fall by at least 30% relative without reducing task success by more than 5 points.
4. Do not promote if median latency or median token use exceeds 1.5× monolithic unless reliable completion improves by at least 10 points.
5. Any component missing its ablation gate is merged/removed rather than scaled.

## Analysis freeze

- Paired comparison by `task_id`.
- 10,000 paired bootstrap resamples for the reliable-completion difference, fixed RNG seed recorded before analysis.
- Report raw per-arm counts and rates; do not report only aggregated score.
- Report all task-level rows, failures, timeouts and unscorable rows.
- Missing/failed tasks count as unsuccessful for reliable completion unless the protocol itself is invalidated for all arms on that row.
- No post-hoc family deletion or cherry-picking.

## Integrity boundaries

- O0 remains the highest currently verified Olympus maturity gate until this experiment is actually run and retained.
- Hermes/Prometheus/Perseus/Atlas/Kronos names remain runtime-role evidence, not proof of separately trained frontier models.
- No 12B/128B/1T/2T/8T scale claim is promoted by this experiment.
- Negative, null or mixed results are valid terminal outcomes.
- No larger Olympus training is authorized by this preregistration alone.

## Definition of O1 execution-ready

O1 is `RUN_READY` only when all of the following are committed before any scored run:

- the 100-row task manifest;
- provider/runtime freeze metadata;
- four exact prompt/config definitions;
- executable harness command;
- deterministic analysis script;
- artifact output schema;
- CI/unit checks showing the harness cannot silently vary budgets across arms.

Until then, status is `PREREGISTERED_NOT_RUN`.
