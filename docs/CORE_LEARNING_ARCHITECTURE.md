# VertexED core learning and exam architecture

## Product boundary

VertexED has two separate promises:

1. Help a learner practise for a supported examination.
2. Help a learner repair the concepts that caused an error.

Neither promise is available merely because a learner selected a board. A learner may only receive scored exam analytics when the selected curriculum, component, question, and mark scheme are in the authorised and reviewed catalogue. All other AI output is formative guidance and is labelled accordingly.

## Smallest complete flow

```text
Curriculum/component selection
  -> authorised source/version
  -> parse + human review
  -> verified question, mark points, classifications
  -> diagnostic/practice session
  -> response + grading decision
  -> learning evidence
  -> mastery/scheduling/recommendation
  -> progress view with evidence and uncertainty
```

1. A student chooses a *supported* curriculum version, subject, level, component, and exam date.
2. A content administrator registers a source, its rights basis, allowed uses, checksum, source locator, series, and version. It is unusable until approval.
3. A parser may propose question boundaries, marks, classifications, and mark points. Each item retains parser version and confidence. A reviewer must verify any item used for assessment.
4. A diagnostic or practice session samples only verified questions. The selection record retains question and rubric versions.
5. Objective items are deterministically scored. Constructed responses are either (a) rubric-point assisted feedback marked `feedback_only`, or (b) a reviewed scoring decision. A model never becomes an official or final grade.
6. Only verified scores create learning evidence. Evidence updates a topic/concept state, schedules review, and makes a recommendation with an explanation of the underlying evidence.
7. Progress displays evidence coverage, attempt count, recency, and uncertainty. It does not predict an exam result.

## Information model

| Area | Core records | Non-negotiable metadata |
|---|---|---|
| Curriculum | curriculum, subject, curriculum node, prerequisite edge | board, specification/version, component, language, source locator, review state |
| Copyright | content source, source version | rights holder, licence/permission, permitted uses, expiry, checksum, series/page locator, approval audit |
| Assessment | question, mark point, classification, session, item, response | source/version, marks, parse confidence, human review state, rubric version |
| Learning | evidence, mastery state, scheduled review, recommendation | evidence reliability, score bounds, rule/model version, explanation, created time |
| Governance | admin audit log | actor, action, entity, before/after data, reason, timestamp |

## Evidence and uncertainty

Deterministic facts, model suggestions, and generated prose must stay separate.

| Kind | Examples | What the product may say |
|---|---|---|
| Deterministic | selected component, verified question marks, MCQ score, time spent | factual statement with source/version |
| Reviewed assessment | rubric-point decision approved by a reviewer | scored practice result, not an official board grade |
| Model-assisted | topic classification, rubric feedback, misconception hypothesis | suggestion with confidence and review state; never ground truth |
| Generated explanation | worked explanation or original practice | learning aid, source-constrained where source material exists |

Mastery is a Beta evidence state, not a percentage guessed from engagement. It starts as `insufficient evidence`; each eligible independent attempt updates weighted alpha/beta evidence. A UI may show a probability band only after the configured minimum evidence weight, together with its evidence count and recency. Engagement, flashcard count, and self-confidence never change mastery.

## Recommendation rules

The first production rules are deterministic and versioned:

1. A verified low-confidence concept with an overdue review has priority.
2. A concept prerequisite is recommended before its dependent concept when the prerequisite has weaker evidence.
3. A high-mark, frequently assessed topic is only prioritised when its analytics derive from an authorised, declared coverage set.
4. No recommendation is emitted without the supporting evidence IDs and a learner-readable explanation.

Learned ranking can be added only after offline evaluation proves improvement over these rules. It must be versioned, monitored for calibration, and able to fall back to deterministic rules.

## Grading boundary

- Exact-answer and selected-response items: deterministic scoring only.
- Structured responses: rubric-point feedback may identify possible evidence, but the score remains `feedback_only` until a reviewed scorer is available.
- Unsupported question type, unavailable rubric, low parse confidence, or conflicting evidence: withhold marks and ask for a teacher/official scheme check.
- Never display `official`, `examiner`, `accurate grade`, predicted grade, or an exam-result forecast.

## Safe public claims

Until a supported catalogue has passed its release checks, describe VertexED as an AI-assisted study workspace with original practice and non-official feedback. For a released catalogue, say only: “Practice and analytics are available for the listed authorised curriculum components.” State coverage, last review date, and exclusions beside the claim.

## Release gates

1. Every published question has an approved source version, verified mark total, verified classifications, and provenance locator.
2. Every scored outcome is reproducible from stored question/rubric versions and decisions.
3. Golden-set grading tests meet the declared threshold for the supported question type; low-confidence cases withhold a score.
4. Mastery/recommendation tests prove that engagement-only events cannot modify learning state.
5. A cross-account and deletion test proves no learner can read another learner's local or cloud state.
6. The public claim matrix, mobile flows, keyboard flows, screen-reader flow, and error/empty/loading states are tested before release.
