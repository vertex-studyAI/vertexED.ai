# T2424-0027 Preprint Readiness

Status: **NO-GO / TWO-STAGE TECHNICAL MANUSCRIPT ASSEMBLED; RELEASE QA OPEN**

## Evidence state

T2424-0027 now has two scientifically separate retained evidence lines.

### Stage A — controlled synthetic mechanics

The deterministic synthetic package is merged, tested, independently reproduced, and bound to retained evidence.

- raw concept accuracy: `1.0`
- raw language accuracy: `1.0`
- centered concept accuracy: `1.0`
- centered language accuracy: `0.3611111111111111`
- chance language accuracy: `0.3333333333333333`
- normalized excess language-leakage reduction: `0.9583333333333334`
- global-centering language accuracy: `1.0`
- verdict: `PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS`
- independent reproduction SHA-256: `0eac35dd7b8af1488efab0392c2e82dab8f9a90332af7c6ad54633263fa13605`

This supports only the controlled synthetic mechanics claim.

### Stage B — frozen real encoder v3

The separately preregistered v3 outcome executed successfully as an experiment and produced a retained scientific negative against the complete success gate.

- protocol: `T2424-0027-REAL-ENCODER-GATE-v3`
- execution commit: `db38d01126835f906f03af8b2147c518d71a7c07`
- workflow run: `33303431963`
- artifact ID: `9729715965`
- artifact ZIP SHA-256: `3eb1d7352e48ad5803b746766a393baf881a4b9ebba49cad8c55340367b9c79d`
- mean raw language accuracy: `0.49235555555555555` (required `>=0.75`) — **FAIL**
- mean effect retention: `0.8713252358181732` (required `>=0.70`) — PASS
- mean intent drop: `-0.002488888888888874` (required `<=0.02`) — PASS
- mean specificity margin: `0.8168639008523437` (required `>=0.15`) — PASS
- seed passes: `0/5` (required `4/5`) — **FAIL**
- verdict: `FAIL_PREDECLARED_REAL_ENCODER_GATE`
- thresholds moved after outcome access: **no**

The negative gate verdict is driven by insufficient baseline locale predictability, not by an infrastructure failure. The retained quantitative falsifiers for effect collapse, damaging intent loss, and generic-control equivalence are all false.

## Paper-conversion artifacts

- [x] `MANUSCRIPT.md` assembled from frozen Stage A and Stage B evidence
- [x] `REAL_ENCODER_V3_RESULT.md` records real-encoder provenance, aggregate metrics, per-seed metrics, and claim boundary
- [x] `RELATED_WORK_AUDIT.md` uses primary multilingual-representation sources
- [x] frozen synthetic claim boundary retained
- [x] frozen v3 real-encoder claim boundary retained
- [x] synthetic thresholds retained without post-result changes
- [x] v3 thresholds retained without post-result changes
- [x] negative/generic controls reported
- [x] real v3 negative retained instead of rescue-tuned
- [x] synthetic run/verifier/test commands retained
- [x] evidence-derived synthetic figure retained with provenance
- [x] v3 execution run and artifact digest recorded
- [ ] archive the full v3 artifact payload in a durable repository/release location rather than relying only on 90-day Actions retention
- [ ] add a real-encoder results figure/table source file generated directly from retained metrics
- [ ] final author/contribution statement
- [ ] repository/release license state resolved
- [ ] formatted PDF compiled and visually checked
- [ ] final sentence-level claim audit after PDF formatting

## Publication boundary

The manuscript may report both the synthetic PASS and the real-encoder v3 negative, provided the verdicts remain separate. It must not present either stage as evidence for:

- linguistic relativity or the Sapir–Whorf hypothesis;
- human cognition or cultural effects;
- translation quality or zero-shot transfer performance;
- semantic universals;
- universal language-invariant representation learning;
- superiority of the tested encoder or transform over other models/methods;
- external validity beyond the frozen data/model/probe configuration.

The v3 result must not be relabeled as a PASS because its transform-specific metrics are favorable. The frozen baseline and seed-pass conditions remain part of the decision rule.

## Successor gate

Any protocol that asks a different question after the v3 outcome—for example, whether language centering reduces whatever locale signal is present even when baseline predictability is moderate—must receive a new protocol ID and be preregistered before outcome access. It may not reuse v3 while changing the raw-language threshold, seed gate, model, dataset, controls, or hypothesis.

## Release verdict

**NO-GO for public preprint release at this checkpoint.** The evidence base is now substantially stronger and more honest because the real-encoder negative is integrated rather than omitted. Remaining blockers are durable artifact archiving, a real-result figure/table source, authorship, licensing, PDF production, and final claim-language review. These are release-engineering/editorial blockers; they do not authorize any change to the frozen scientific outcomes.
