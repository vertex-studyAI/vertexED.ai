# NPMS: Reproducible Controlled Memory Evidence Without a Natural-Task Causal Claim

**Status:** internally complete technical-report manuscript from retained evidence; not externally validated.  
**Claim boundary:** controlled diagnostic plus companion learned evidence only.

## Abstract

NPMS evaluates a memory mechanism in a controlled setting and pairs the diagnostic with trained recurrent baselines. The retained package reproduces the controlled mechanism evidence and includes RNN/GRU companion results, but stronger invariant-parameter and state-space controls prevent a unique causal interpretation, and no frozen natural-task/OOD study establishes transfer. We therefore report NPMS as an inconclusive but reproducible controlled diagnostic. The paper's contribution is a transparent separation between mechanism evidence, learned companion evidence, and the stronger natural-task causal claim that remains untested. Any successor must freeze a natural or causal-intervention protocol against strong invariant-parameter, state-space, spectral, and learned-memory controls before outcome access.

## 1. Motivation

Memory mechanisms are easy to over-interpret when evaluated only on tasks constructed to expose the mechanism. NPMS asks whether a controlled diagnostic can survive stronger learned and structural controls and whether that evidence transfers beyond the controlled setting.

## 2. Retained Evidence

The retained package reproduces the controlled diagnostic and includes trained RNN/GRU companion evidence. These results demonstrate that the phenomenon is executable and reproducible under the designed protocol.

However, an invariant-parameter control leaves causal uniqueness unresolved. The current evidence therefore cannot support a claim that NPMS uniquely causes the observed effect, nor can it establish natural-task or OOD superiority.

## 3. Result Boundary

| Claim | Verdict |
|---|---|
| Controlled diagnostic reproduces | **SUPPORTED** |
| Companion learned evidence exists | **SUPPORTED** |
| NPMS uniquely causes the effect | **INCONCLUSIVE** |
| Natural-task/OOD transfer is established | **UNSUPPORTED** |
| Broad memory superiority | **UNSUPPORTED** |

## 4. Failure Analysis

The key limitation is not simple run instability. It is identifiability. When strong controls can reproduce or absorb the apparent benefit, the diagnostic no longer isolates the proposed mechanism. Additional repetitions of the same controlled test would not solve that causal problem.

## 5. Limitations

The current evidence is dominated by a controlled environment. External validity, naturalistic sequence structure, and OOD behavior remain untested under a frozen protocol. Strong state-space, spectral, and invariant-parameter baselines must be treated as first-class comparators.

## 6. Next Scientific Gate

A new NPMS study should preregister a natural or causal-intervention task, baseline family, metric hierarchy, seed policy, and OOD split. The protocol must include strong invariant-parameter/state-space/spectral controls and learned-memory baselines before any outcome run is authorized.

## 7. Conclusion

NPMS currently supports a reproducible controlled diagnostic, not a unique causal or natural-task superiority claim. The result is scientifically useful precisely because it exposes the gap between mechanism demonstration and causal transfer. The current version should remain bounded to that conclusion.
