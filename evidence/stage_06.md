# VertexED Stage 06 — frozen AI evaluation harness

**Gate: PASS within the frozen synthetic boundary.** The versioned v2 six-case fixture
and threshold file contain declared synthetic data. `npm run eval:grading` reproduces a
JSON artifact with dataset, threshold, and grader-implementation SHA-256 identities.
Results: review-decision accuracy 1.0, false-verified and severe-false-verified rates 0,
grounding-failure capture 1.0, remediation-choice accuracy 1.0, normalization failure
rate 0, accepted-evidence precision 1.0, and evidence acceptance 0.6. Observed local
normalization latency was 4.85 ms for the six-case run.

Matched baselines: always-grade accuracy 0.3333/false-verified 1.0; simple rules
0.6667/0.5; retrieval rules 0.8333/0.25. The live-model baseline is explicitly `NOT_RUN`.

Artifacts: `evals/grading/frozen-v2.json`, `thresholds-v2.json`, and
`evals/results/grading-v2.json`. Dataset SHA:
`8e788d33ec1b2c8204962de9e850fea09dcc73af6e750246960dd582c5e0a85a`.
Threshold SHA: `434c6d2b805be402ece9a223f51552bf9c9624f2b65d53a361f5a99b9a6ecf60`.
Grader implementation SHA:
`b1508a4ec28207e297f4893096d60dbcc21daf38d9e9346ce96ceba99b01e917`.
Harness regression tests PASS 5/5.

Truth boundary: the latency metric covers local contract normalization only. Provider
latency/failure rate and live model/remediation quality were not measured; the artifact
forbids those claims.
