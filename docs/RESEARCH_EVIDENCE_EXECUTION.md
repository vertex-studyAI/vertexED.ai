# Research evidence execution

Status: analysis code complete; participant recruitment, consent, authentic submissions,
blinded human scoring, and outcome collection remain external and unperformed.

The frozen learning design is `VERTEXED_CONTROLLED_PILOT_PROTOCOL_202609.md` and
`docs/PILOT_PROTOCOL.md`. Feed de-identified rows to
`analyzeLearning` in `evals/research/evidence-analysis.mjs`. Each learner must have
one `vertexed` and one `control` row. The analyzer retains incomplete pairs, reports
condition-specific attrition, paired immediate and delayed effects, deterministic
bootstrap intervals, sign counts, and leave-one-out sensitivity. Fewer than 30 complete
pairs remain exploratory.

Grading validation requires at least 200 authentic, consented submissions, at least 30
per predeclared subgroup, two independent blinded human scores per submission, blind
adjudication, the exact provider score, and the provider confidence. `analyzeGrading`
reports human-pair disagreement, provider error, five-point agreement, calibration at
the frozen 50-point decision boundary, every subgroup, and the worst subgroup error.
Synthetic fixtures are prohibited as validity evidence.

Before collection, hash the protocol, scoring key, item forms, application revision,
provider/model configuration, and blank data dictionary. Retain exclusions and missing
outcomes. Publication requires the applicable ethics/consent determination and an
independent analyst to reproduce the raw-to-report output. No learning-efficacy or
grading-validity claim is authorized until both analyzers report `RESULT_READY` and the
predeclared scientific thresholds are reviewed without post-outcome changes.
