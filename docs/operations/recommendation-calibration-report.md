# Recommendation calibration diagnostic

Related issue: #763. Status: working offline renderer; **not wired to production telemetry**, not an experiment, not a calibrated model, and not a release gate.

At inspected main `f4dbbb4bc9d0942332b03b32d65e3e39f1052382`, `src/lib/adaptiveLearning.ts` exposes topic mastery/weakness percentages and subjective confidence ratings. Those are **not** recommendation-level predicted probabilities paired with binary observed outcomes. Do not relabel them or synthesize production evidence to populate this view. No existing model, recommendation logic, auth, database, RLS, CI gate, frozen protocol, or research outcome is changed.

## Run

Use the repository-pinned Node 22 release (`package.json` requires >=22.22.0 <23) and existing dependencies for the full repository CI. The isolated renderer and its unit tests use only Node built-ins:

```sh
node --test tests/recommendation-calibration-report.test.mjs
node scripts/render-recommendation-calibration.mjs /private/export.json /private/calibration-v1.html --version v1
```

The input is read-only. The output must not exist; exclusive creation protects prior artifacts and rejects output symlinks. On POSIX the output has mode 0600. Maximum input: 5 MiB, 10,000 records. No HTTP request, model inference, fitting, label generation, or credentials are involved. Open the generated HTML locally. Do not expose student identifiers, restricted outcomes, or production exports through public CI artifacts.

## Input contract

Required envelope:

- `schemaVersion`: numeric `1`.
- `evidenceKind`: `observed` for an exporter-declared retained observation set, or `synthetic-test` for engineering fixtures. This declaration is **not independently authenticated** by the renderer. Test fixtures receive a prominent warning.
- `provenance.sourceCommit`: exact lowercase 40-character source commit.
- `provenance.sourceArtifact`: retained source artifact identifier; rendered as escaped text, not an active link.
- `provenance.confidenceDefinition`: what the confidence estimates; it must represent the probability of the binary success event, not a rank, mastery score, or subjective rating.
- `provenance.outcomeDefinition`: the binary success/failure definition and relevant observation window established by the exporter.
- `records`: array with unique `(version, id)` pairs. Each row requires nonempty `id` and `version`, a finite numeric `confidence` in [0, 1], and `outcome` equal to numeric 0, numeric 1, or explicit null. A resolved outcome also requires nonempty `outcomeSource` pointing to retained evidence.

Strings are bounded to 500 characters. Undefined outcomes, boolean/string/coerced probabilities, partial-credit labels, duplicate identities, missing provenance, invalid UTF-8/JSON, and oversized inputs fail rather than being silently dropped. Unknown extra fields are not rendered. Partial-credit outcomes need a separately specified contract, not ad-hoc thresholding in this tool.

The selected version is explicit and exact. Rows from other versions are excluded; an unknown version returns an empty state. An exporter must establish that probabilities were recorded before outcomes and explain missingness/selection, dataset provenance, time windows and any repeated subjects. A self-declared source SHA alone cannot demonstrate these properties. Freeze those decisions before new evidence generation; this renderer never authorizes a new experiment.

## Interpretation

Ten fixed bins are `[0.0,0.1)`, ..., `[0.9,1.0]`. Exact boundaries are tested without epsilon rounding; 1.0 belongs to the last bin. For each bin, `total = labeled n + unresolved`. Both mean confidence and empirical rate use the **same labeled rows**. A bin with zero labeled outcomes has unavailable metrics, not a zero rate; no line interpolates across empty bins.

Each plotted point exposes labeled n. Hollow points and table labels identify n<10 as sparse. Ten is a display warning threshold, not a statistical power calculation; larger bins remain descriptive. The visible high-confidence-failure table includes every selected row with confidence >=0.8 and outcome 0. This is a presentation threshold, not a pass/fail criterion or changed metric denominator. All selected observations remain inspectable through native keyboard-accessible details and horizontally scrollable tables on mobile.

Secondary metrics are Brier = mean((confidence-outcome)^2) and ECE = sum(n_bin/n * abs(mean_confidence_bin-empirical_rate_bin)). They are unavailable with no labels. Missing outcomes are reported separately and can introduce selection bias; repeated/correlated records are not independent replication. Neither metric implies causality, statistical significance, deployment readiness, or a scientific result.

The HTML binds the SHA-256 of the exact input bytes and shows the exporter-declared provenance. It contains no scripts or external assets, escapes all supplied strings, and includes a restrictive Content Security Policy. Native HTML details remain usable without JavaScript.

## Remaining production acceptance gate

Do not close #763 as a live feature until a permission-appropriate exporter supplies genuine per-recommendation probabilities, versions, pre-outcome timestamps and retained outcome sources; verifies that definitions and windows were not changed after seeing outcomes; and the view is integrated into an authenticated product route with account isolation and existing browser/CI checks. Do not unlock or modify any frozen research dataset to obtain these records.
