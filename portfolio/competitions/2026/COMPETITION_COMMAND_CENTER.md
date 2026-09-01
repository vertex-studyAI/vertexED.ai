# 2026 Competition Command Center

Status date: 2026-08-28

This file turns the current portfolio into a small number of evidence-driven competition entries. It does not upgrade research claims or treat an implemented feature as a validated outcome.

## P0: VertexED venture competitions

Primary competitions:
- UPES Future Founders — immediate submission track
- Diamond Challenge — reuse the same venture/evidence base, deeper by January
- Blue Ocean Competition — reuse the venture with a value-innovation framing

Competition thesis:

> VertexED is a board-aligned mastery system that closes the loop between what a student studies, what they can answer under exam conditions, how the answer is evaluated, what concept/skill gap caused lost marks, and what they should do next.

Judge path to harden:
1. Sign up / log in.
2. Select curriculum, subject and topic.
3. Generate or choose a syllabus-aligned assessment item.
4. Submit an answer.
5. Receive mark-scheme/rubric aligned review.
6. Show the concept/skill gap.
7. Recommend the next action.
8. Retest the same skill with a different item.
9. Record the result in a mastery/progress view.

Do not claim this full loop is production-ready until the existing production gate and QA evidence are green.

## VertexED evidence targets

Before using any metric publicly, preserve the source export/screenshot/log and date.

- 15+ student problem interviews
- 5+ teacher interviews
- 20–30 student bounded pilot, if consent/logistics allow
- fixed pre/post assessment for one tightly scoped unit
- completion rate
- repeat usage rate
- 3–5 quotable testimonials with permission
- documented pilot commitment(s)
- first paid conversion only if genuine; never manufacture one

Bounded learning claim template:

> In a bounded pilot on [topic], [n] students who completed [intervention] changed from [pre] to [post] on a fixed/equated assessment. This result does not establish general educational effectiveness.

## P1: Breakthrough Junior Challenge

Working concept: `How Can Perfect Equations Become Unpredictable?`

Scientific spine:
- deterministic system
- nearby initial conditions
- divergence
- Lyapunov exponent
- positive lambda and exponential error growth
- distinction between chaos and randomness
- practical prediction horizon

Required assets:
- <= 2:00 script
- two-trajectory animation
- microscopic initial-separation visual
- exponential-growth visual for Delta(t) ~= Delta_0 e^(lambda t)
- real-system montage used carefully (weather/turbulence/population/long-horizon orbital dynamics)
- final captioned export
- peer-review completion after submission

## P1: Wharton Global High School Investment Competition

Treat as a portfolio-research process, not a stock-picking game.

Templates required:
- client objective/constraint memo
- investment policy statement
- company memo
- macro memo
- portfolio allocation sheet
- risk register
- decision journal
- weekly investment-committee notes

Every proposed holding must answer:
1. Why this asset?
2. Why now?
3. Why for this client?
4. What evidence would falsify the thesis?
5. What happens if the thesis is wrong?

## P1: Research competition packet

LAM-JEPA currently has a real executable research pipeline but its ARC-v5 development-validation result is negative/inconclusive under its frozen gate. Preserve that boundary.

Package it as:
- question
- frozen protocol
- strongest baselines
- method
- matched evaluation rows
- multi-seed statistics
- ablations/calibration/OOD results
- negative or inconclusive result
- failure analysis
- limitations
- reproducibility commands
- paper, one-page abstract, poster and five-minute talk

Never convert CI success into a scientific-superiority claim.

## P2: Weather-JEPA / GridCast candidate

This remains a candidate until an accessible repo and executable evidence are located.

Proposed hypothesis:

> Self-supervised predictive representation learning may retain more forecasting utility than supervised-only training under missing data, low-label regimes, or geographic distribution shift.

Pre-register success criteria before experiments. Compare against persistence, seasonal naive, linear/tree baseline, sequence model and comparable supervised neural baseline. Report failure if the hypothesis is not supported.

## P2: Space-JEPA / AstroShift candidate

Do not force-fit this into NASA Space Apps before the official 2026 challenge statement is selected.

Prebuild reusable components only:
- NASA/partner data ingestion
- cleaning and missingness handling
- classical baseline
- representation model hook
- uncertainty/error analysis
- interactive visualization
- evaluation harness
- demo/story shell

## Evidence rules

1. Existing code != working product.
2. Passing CI != production readiness.
3. Production readiness != customer validation.
4. Customer usage != learning effectiveness.
5. Synthetic benchmark accuracy != natural-language answer correctness.
6. Development-validation evidence != confirmatory-test evidence.
7. Negative results remain negative.
8. Every public number must have a dated source artifact.

## Immediate execution order

1. Run VertexED `npm run ci` on the exact competition branch/head in a local or CI environment with no production claim until it passes.
2. Run production smoke only against the intended deployment.
3. Complete the deterministic judge-path QA checklist.
4. Start user/teacher evidence collection with a fixed interview script.
5. Produce Breakthrough rough cut and time it.
6. Build the Wharton research templates and assign team roles.
7. Generate the LAM-JEPA current paper-results package without changing the frozen claim boundary.
8. Locate or create explicit repos for Weather-JEPA and Space-JEPA before implementation work is credited.
