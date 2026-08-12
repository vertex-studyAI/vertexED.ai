# APEN / PEN Results

**Wave date:** 2026-08-12  
**Source package:** `BU1LD_Research_Atlas_Flagships_v4_FRESH_2026-08-12.zip`  
**Source SHA-256:** `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`  
**APEN status:** **FRESHLY REPRODUCED SYNTHETIC MECHANISM/TRADEOFF**  
**PEN status:** **NOT SEPARATELY EXECUTABLE**

## Hypothesis

On the frozen synthetic delayed-signal task, adaptive persistent event memory should reduce error on rare delayed contributions relative to recent-window, uniform-memory and exponential-trace baselines, while its advantage should weaken when the salience signal used by the mechanism is corrupted or removed.

## Task and protocol

The experiment uses synthetic autocorrelated five-dimensional sequences with delayed rare contributions at delays 12, 24 and 48 and noise levels 0.2 and 0.5. Eight paired deterministic seeds are evaluated per delay/noise condition, giving 48 paired conditions. Ridge regularization is selected on the same chronological train/validation split for every method.

Compared methods: APEN, recent-window baseline, uniform-memory baseline, exponential-trace baseline and oracle-delay reference.

## Fresh base result

Mean MSE aggregated over the frozen condition table:

| Method | Overall MSE | Rare-event MSE |
|---|---:|---:|
| APEN | 2.210393 | 17.060349 |
| Exponential trace | 2.145430 | 18.860263 |
| Oracle delay | 2.056096 | 16.687710 |
| Recent window | 2.133970 | 18.967381 |
| Uniform memory | 2.240880 | 18.714592 |

Paired rare-event comparisons across `n=48` conditions:

- APEN − recent: `-1.907033`, 95% CI `[-2.216717, -1.599460]`;
- APEN − exponential trace: `-1.799915`, 95% CI `[-2.090221, -1.516058]`;
- APEN − uniform: `-1.654244`, 95% CI `[-1.904073, -1.401564]`;
- APEN − oracle: `+0.372638`, 95% CI `[-0.384492, 1.099070]`.

The result supports a rare-event advantage over the simple memory baselines in this synthetic construction. It does **not** support overall-MSE superiority, and it does not establish superiority over the oracle reference.

## Salience-dropout mechanism stress test

The frozen robustness extension uses dropout rates `0`, `0.2`, `0.5`, `0.8`, `1.0`, delays 24 and 48, and eight paired seeds per condition.

Rare-event MSE:

| Salience dropout | APEN | Exp. trace | Recent | Uniform |
|---:|---:|---:|---:|---:|
| 0.0 | 18.100377 | 19.528214 | 19.560112 | 19.130742 |
| 0.2 | 18.120478 | 19.496563 | 19.437407 | 19.227547 |
| 0.5 | 18.342333 | 19.029804 | 19.112505 | 18.705349 |
| 0.8 | 18.879040 | 18.952464 | 18.982059 | 18.841510 |
| 1.0 | 20.906161 | 20.772492 | 20.814618 | 20.510165 |

The APEN advantage nearly disappears at 80% salience dropout and reverses at 100%. This is retained as a mechanism limitation/falsifier, not hidden.

## Reproducibility checks

The full Atlas test suite passed `39/39`. For selected APEN/Eigen-JEPA/NPMS outputs, numerical files and PNG figures reproduced exactly; APEN's two generated PDFs differed only in embedded Matplotlib `CreationDate` metadata.

## Claim boundary

This is a controlled synthetic mechanism result. It does not establish real-world sequence-model superiority, long-context language-model gains, publication novelty or a distinct PEN result. The frozen package contains an APEN implementation; PEN appears only as architecture-family provenance and is therefore not counted as a separate experiment.
