# APEN: Salience-Dependent Rare-Event Memory Under Controlled Stress

**Status:** internally complete technical-report manuscript from retained evidence; not externally validated.  
**Claim boundary:** controlled mixed result only; no universal or naturalistic superiority claim.

## Abstract

APEN tests whether a salience-aware memory mechanism improves performance on rare-event conditions and whether any benefit survives degradation of the salience signal. The retained controlled study contains 48 paired conditions and a salience-dropout stress analysis. The principal result is mixed: localized rare-event benefits are reproducible, but they weaken and can reverse under severe salience dropout, and the method does not establish an overall MSE advantage. The evidence therefore supports a salience-dependent tradeoff rather than a general superiority claim. We preserve this failure mode and specify the next scientific gate as a new protocol with a matched learned memory baseline, a naturalistic task, a frozen salience-quality model, and preregistered failure-region controls.

## 1. Motivation

Rare events are difficult for memory systems because the events most worth retaining are often the least statistically common. APEN proposes salience as a mechanism for selective retention. The scientific question is not merely whether the mechanism helps when the salience signal is accurate, but whether the advantage is robust when that signal is incomplete or wrong.

## 2. Frozen Study

The retained experiment evaluates 48 paired controlled conditions and explicitly perturbs salience quality through dropout. The analysis preserves the original experiment metadata and does not replace the primary result with a more favorable metric after inspection.

## 3. Results

The study reproduces a localized rare-event benefit under favorable salience conditions. However, performance degrades as salience quality worsens; under severe dropout, the benefit weakens substantially and can reverse. The retained package does not establish an overall MSE win.

Accordingly:

| Claim | Verdict |
|---|---|
| Localized rare-event benefit under controlled salience | **SUPPORTED** |
| Robust benefit under severe salience degradation | **FAILED / INCONCLUSIVE** |
| Overall MSE superiority | **UNSUPPORTED** |
| Universal advantage over learned memory systems | **UNTESTED** |

## 4. Failure Analysis

The result identifies salience quality as a first-order dependency. A mechanism that selectively preserves events can only be as reliable as the signal used to decide which events matter. This dependence is scientifically important because it converts an apparent mechanism advantage into a conditional tradeoff.

## 5. Limitations

The benchmark is controlled and synthetic. A matched learned memory baseline is missing. Naturalistic salience estimates are not evaluated. External reproduction is absent. Therefore the paper does not claim deployment relevance or broad memory superiority.

## 6. Next Scientific Gate

A future APEN study must be versioned as a new protocol and include: a matched learned memory comparator; a naturalistic task; an explicitly frozen salience model; preregistered degradation levels; and failure-region metrics that prevent aggregate averages from hiding collapse.

## 7. Conclusion

APEN produces a reproducible controlled tradeoff rather than a universal gain. Rare-event performance can improve when salience is reliable, but the advantage weakens or reverses as salience quality degrades. The correct scientific disposition is mixed/inconclusive, with the failure mode retained as a central result rather than treated as a tuning target.
