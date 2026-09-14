# Professor-guided VertexED study execution layer

This addendum converts the current external methodology guidance into machine-checkable study gates.

## Learning trial

For the Dan Schwartz-guided learning comparison, `generateBalancedAssignments` creates a reproducible, near-equal two-arm assignment from a frozen participant manifest and seed. The output records the participant-manifest hash and a SHA-256 commitment to the seed. For confirmatory use, the seed commitment and participant manifest should exist **before** treatment exposure or outcome inspection; the seed can be disclosed later for audit.

`validateTrialManifest` then checks:
- a unique participant and assignment token;
- observed condition exactly matches the predeclared assignment;
- equal session duration (default 60 minutes);
- topic and assessment-form IDs are recorded;
- an optional **predeclared** topic-headroom ceiling is obeyed.

Neither helper can prove prospective randomization by itself. The seed commitment, participant manifest, assignment artifact, and timestamps must be preserved.

The primary learning endpoint remains the already-frozen learning outcome analyzed by `analyzeLearning`; these manifest checks should not be used to swap endpoints after data collection.

## Confidence calibration

For the Dominik Moritz-guided confidence/support/outcome view, `analyzeCalibration` produces:
- overall accuracy, mean confidence, confidence-minus-accuracy gap, Brier score, and ECE;
- reliability-bin data suitable for a calibration plot;
- **confidence × observation-density bins separated by correct/incorrect outcome**, matching the requested visual diagnostic;
- the same descriptive summaries stratified by whether explicit support/evidence was present;
- participant-level summaries and an input SHA-256.

`support_present` is descriptive unless support is independently randomized. Do not infer that support *caused* better calibration from a stratified observational comparison.

## Return artifact

After real pilot data exist, return:
1. the seed commitment and validated trial-manifest hash;
2. the learning effect output;
3. the confidence/outcome density + calibration reliability table/figure;
4. attrition and any protocol deviations.

Do not send a result-only figure without the manifest/protocol identity that generated it.
