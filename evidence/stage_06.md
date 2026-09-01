# VertexED Stage 06 — frozen AI evaluation harness

**Gate: PASS within the frozen synthetic boundary.** The versioned six-case fixture and
threshold file contain declared synthetic data. `npm run eval:grading` reproduces a JSON
artifact with dataset and threshold SHA-256 identities. Results: review-decision accuracy
1.0, false-verified rate 0, accepted-evidence precision 1.0, evidence acceptance 0.6.
The matched always-grade baseline has false-verified rate 1.0 and accuracy 0.3333.

Artifacts: `evals/grading/frozen-v1.json`, `thresholds-v1.json`,
`evals/results/grading-v1.json`. Dataset SHA:
`4994ba508f70c92cc76978dde509311797c1c69ffcf79aa9b2d6e092efd1b2e0`.
Threshold SHA: `b7752fda6f84bb9e383cdbdf9bc16a7c2bb5cbd8c2fcfc96b8fff27620814dfc`.
Harness regression tests PASS 4/4.

Truth boundary: latency, provider failure rate, live hallucination severity, and live
model/remediation quality were not measured; the artifact forbids those claims.
