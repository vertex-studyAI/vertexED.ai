# RESEARCH_STATUS

As of: 2026-08-12 20:12 IST

Maturity labels are evidence-backed and intentionally conservative.

| Research line | Current state | Evidence | Required promotion gate |
|---|---|---|---|
| T2424-0037 NeuroCAD | TESTED + MERGED CONTROLLED BENCHMARK | repaired current-main recovery, CI #914 success, merged `c0a2e546...` | OOD language set, real backend robustness, independent reproduction, learned/direct baseline if claiming research advantage |
| T2424-0025 robust readouts | EXPERIMENTED + ANALYZED + MERGED | 50-seed contamination sweep; robust estimators beat mean at 18%, but also at 0% control | isolate mechanism against robust Gaussian/reference controls; repeat across data regimes |
| T2424-0050 Darcy | BOUNDED EXPERIMENT + MERGED IDENTITY | synthetic pressure-MAE screen and canonical identity repair | learned operator implementation, matched baselines, held-out dataset/regime testing |
| Hercules | ARCHITECTURE/IMPLEMENTATION FAMILY, SCALE CLAIMS LIMITED | trainable/local-model architecture ownership separated from Olympus names | matched-budget Transformer comparison and ablations |
| Olympus | O0 ROADMAP/RUNTIME RATIONALIZATION | named roles/scale concepts separated from trained-model evidence | O1 learned-provider/baseline experiment; no scale-name promotion without checkpoint+eval evidence |
| Hermes / Prometheus / Perseus / Atlas / Kronos | CONCEPT/RUNTIME NAMES UNLESS SPECIFIC ARTIFACT PROVES MORE | no evidence here supports trained parameter-scale model claims | implementation→training→evaluation→ablation→release gates individually |
| Percy | INFRASTRUCTURE, NOT A RESEARCH RESULT | durable SQLite runtime, evidence gate, leases, state doctor merged | real-host/provider qualification for production claim |
| Research Atlas V4 | LOCAL REPRODUCIBILITY + PACKAGING | recorded 39/39 tests, 18 reruns, extensions, manuscript recompiles and archive regeneration | independent reproduction + manuscript result-table regeneration + external review/submission |
| LAM-JEPA | NEGATIVE/INCONCLUSIVE RESEARCH LINE | connected repository exists; prior portfolio status preserves fail-closed negative/inconclusive interpretation | stronger preregistered replication before any superiority claim |

## Project 2424 triage rule

Advance projects by:

`Research Value × Novelty × Feasibility × Evidence Potential ÷ Remaining Effort`

Prefer projects that can produce an identifiable hypothesis, executable baseline, measurable result, figure/table and failure analysis. Archive or defer attractive names without experimental leverage.

## Strong next experiments

1. **Hercules/Olympus architecture gate:** same dataset/tokenizer/parameter budget/optimizer/training budget; baseline Transformer vs proposed architecture vs ablation; record loss, convergence, memory, throughput, downstream metrics and instability.
2. **NeuroCAD robustness gate:** freeze OOD prompt families and compare deterministic direct emission, validated IR and a same-provider learned direct/IR arm where available.
3. **T2424-0025 mechanism gate:** add robust Gaussian/reference-memory controls so the negative 0% result can distinguish generic robust aggregation from the proposed mechanism.
4. **Darcy operator gate:** implement actual learned operator baselines under matched parameter/training budgets and evaluate held-out physical regimes.

## Paper-factory standard

A candidate is not `PAPER_DRAFT` merely because prose exists. Promotion requires a precise question, related-work positioning, reproducible setup, baselines, metrics, experiments, results, limitations, figures/tables and reproduction instructions. Prefer a few defensible studies over mass-generated manuscripts.