# VertexED × NVIDIA Technical Proof-of-Value Report

**Status:** benchmark harness ready; live provider evidence not yet collected on this source revision  
**Production provider change:** none  
**Candidate NVIDIA model:** `nvidia/nemotron-3-ultra-550b-a55b`

## What is implemented

VertexED already has a production-safe provider abstraction in `api/_lib/aiProviders.js`. OpenAI remains the default. NVIDIA is opt-in through `CHATBOT_PROVIDER=nvidia`, `NVIDIA_API_KEY`, and an explicit `NVIDIA_CHATBOT_MODEL`.

This branch completes the evidence layer required by issue #530:

- the existing 13-prompt regression set remains unchanged;
- `evals/ask/nvidia-poc.jsonl` adds a separate bounded stress set for IB/IGCSE/A-Level tutoring, grounding, reasoning, multi-turn context, academic-integrity boundaries, hallucination pressure, and retrieval prompt injection;
- `run-ask-provider-benchmark.mjs` can now select a prompt set and records source-bound prompt hashes, exact model and endpoint, pass rate, deterministic rubric score, error rate, p50/p95 latency, output length, token usage, grounded-source citation compliance, safety/adversarial pass rate, and optional cost estimates when explicit pricing is supplied;
- `generate-nvidia-poc-report.mjs` turns the retained machine-readable reports into a human-readable technical report without inventing missing measurements;
- `.github/workflows/nvidia-poc.yml` provides a manual secret-backed run that does not expose provider keys and uploads the JSON evidence plus generated report as an artifact.

## Evidence rule

API connectivity is not quality evidence. No latency, quality, grounding, safety, or cost claim should be made until both provider runs complete against the same source revision and the retained JSON artifacts are available.

The live workflow requires repository secrets `OPENAI_API_KEY` and `NVIDIA_API_KEY`. Pricing variables are optional; if they are absent, cost is reported as `n/a`, never as zero.

## Reproduction

Run the two source-bound benchmarks from the repository root:

```bash
REVISION="$(git rev-parse HEAD)"

node evals/scripts/run-ask-provider-benchmark.mjs \
  --provider both \
  --prompts evals/ask/golden.jsonl \
  --source-revision "$REVISION" \
  --out artifacts/nvidia-poc/golden.json

node evals/scripts/run-ask-provider-benchmark.mjs \
  --provider both \
  --prompts evals/ask/nvidia-poc.jsonl \
  --source-revision "$REVISION" \
  --out artifacts/nvidia-poc/poc.json

node evals/scripts/generate-nvidia-poc-report.mjs \
  artifacts/nvidia-poc/golden.json \
  artifacts/nvidia-poc/poc.json \
  artifacts/nvidia-poc/NVIDIA_POC_REPORT.md
```

The generated report and JSON files are the authoritative evidence for any NVIDIA Inception technical follow-up.

## Deployment gate

Keep OpenAI as the production default until a same-revision benchmark is complete and reviewed. A future NVIDIA production change should require acceptable grounding and safety results, no material reliability regression, production-like latency measurements, explicit cost inputs, and a rollback plan.
