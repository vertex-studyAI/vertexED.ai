# T2424-0046 — Auto-Research Foundry

A small, deterministic **research-planning and evidence-gating library** for Project 2424-style execution.

It deliberately does **not** execute arbitrary shell commands. Its job is to make an experiment queue harder to fake or accidentally mis-order.

## What it does

### 1. Validates experiment manifests

Each task must declare:

- immutable task ID;
- project;
- falsifiable claim;
- recorded reproduction command;
- priority (`P0`–`P3`);
- dependencies;
- expected artifacts;
- estimated CPU minutes.

### 2. Compiles dependency waves

The foundry rejects:

- duplicate IDs;
- missing dependencies;
- self-dependencies;
- dependency cycles.

Valid DAGs are converted into deterministic execution waves ordered by priority and ID.

### 3. Applies a CPU-minute budget

`selectWithinCpuBudget()` selects tasks in dependency-safe order. A dependent task is never scheduled when its prerequisite was deferred.

### 4. Gates completion on evidence

A task cannot become `DONE` unless all of these are recorded:

- command exit code `0`;
- every declared expected artifact is present;
- at least one verification check exists;
- every verification check passes.

Missing artifacts, nonzero exit status, missing verification, or failed checks keep the task in `FAILED` with explicit blockers.

## Run the deterministic demo

```bash
node portfolio/project2424/projects/T2424-0046/experiment/run.mjs
```

The demo shows:

- baseline → ablation → report dependency waves;
- a 12 CPU-minute budget selecting only dependency-safe work;
- one legitimately `DONE` task;
- one report that remains `FAILED` because source evidence is absent.

## Test

```bash
node --test tests/project2424AutoResearchFoundry.test.mjs
```

The root canonical CI also discovers the regression file.

## Why this is useful

This package directly encodes several Project 2424 execution rules:

- blocked work must be explicit;
- dependencies matter;
- budgets must not silently break prerequisite chains;
- a successful command is not enough without artifacts and checks;
- planning is separate from execution evidence.

## Claim boundary

This is **not** an autonomous research agent, shell executor, scheduler daemon, scientific reasoning system, or production orchestration platform. It cannot verify whether a claim is scientifically correct. It only validates planning/evidence mechanics supplied to it.

## Safety boundary

- no process spawning;
- no network requests;
- no filesystem deletion;
- no repository writes;
- no deployment;
- no secret handling;
- no command execution.

The manifest `command` is stored only as reproducibility metadata.

## Next evidence gate

Integrate the library with a disposable Project 2424 fixture queue, persist signed/hashed evidence records, add interruption/recovery semantics, test concurrency ownership rules, and independently verify that failed tasks cannot be promoted by malformed evidence.
