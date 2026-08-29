# T2424-0027 Preprint Readiness

Status: **NO-GO / TECHNICAL MANUSCRIPT ASSEMBLED**

## Evidence state

The frozen deterministic synthetic package is merged, tested, independently reproduced, and bound to retained evidence. Its supported claim is limited to controlled latent-diagnostic mechanics.

Key result:

- raw concept accuracy: `1.0`
- raw language accuracy: `1.0`
- centered concept accuracy: `1.0`
- centered language accuracy: `0.3611111111111111`
- chance language accuracy: `0.3333333333333333`
- normalized excess language-leakage reduction: `0.9583333333333334`
- global-centering language accuracy: `1.0`
- verdict: `PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS`

Independent reproduction output SHA-256:

`0eac35dd7b8af1488efab0392c2e82dab8f9a90332af7c6ad54633263fa13605`

Canonical recovery merged through PR #281, merge commit `03eea7acfff37765f1a3d1ab7856f6ac3e7f6fee`.

## Paper-conversion artifacts

- [x] `MANUSCRIPT.md` assembled from frozen evidence
- [x] `RELATED_WORK_AUDIT.md` uses verified primary sources
- [x] current `STATUS.md` corrected to reflect that the canonical package is already merged
- [x] frozen claim boundary retained
- [x] predeclared thresholds retained without post-result changes
- [x] negative control retained in the main result
- [x] exact run/verifier/test commands retained
- [ ] manuscript figures generated from raw evidence
- [ ] final author/contribution statement
- [ ] repository/release license state resolved
- [ ] formatted PDF compiled and checked
- [ ] final sentence-level claim audit

## Publication boundary

The current technical manuscript may describe a deterministic synthetic diagnostic and its reproduced result. It must not present the result as evidence for:

- linguistic relativity or the Sapir–Whorf hypothesis;
- behavior of a real multilingual encoder;
- semantic universals or cultural cognition;
- translation quality or zero-shot transfer;
- language-invariant representation learning;
- external validity or research completion.

Prior work has already studied language neutrality and per-language centering in real pretrained multilingual representations. Publication novelty therefore cannot be inferred from the synthetic PASS alone.

## Successor gate

A real-model successor is scientifically separate. Before outcome access, freeze the encoder and revision, selected layers, representation extraction rule, multilingual dataset, semantic/task labels, language labels, train/dev/test separation, all transforms and controls, primary metric, preservation metric, seeds, uncertainty procedure, success/failure thresholds, compute budget, and stop rule.

The synthetic PASS must not be copied forward as evidence for that successor.

## Release verdict

**NO-GO for public preprint release at this checkpoint.** The evidence and prose are substantially organized, but figure generation, authorship, licensing, PDF production, and final claim-language review remain open. A real-model validation result is not required to publish this as a bounded technical note, but any broader multilingual-representation claim requires that separate evidence.
