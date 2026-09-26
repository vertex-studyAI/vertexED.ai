# Reproduce T2424-0025

## Freeze source

Use repository revision:

```text
0d2a14e559b0caa9b5b1cbeef0995013594ecf15
```

Do not alter the experiment after observing the result. If a defect is found, preserve the failed output, commit the smallest fix separately, and label the rerun as post-fix evidence.

## Environment

The first fresh local reproduction on 2026-08-12 used:

- Node.js `v22.16.0`
- Linux `6.18.35`, x86_64
- 5 logical CPUs visible to the container
- no external API, accelerator, or paid service required

That local Node version is below the repository root engine contract (`>=22.22.0 <23`). The dependency-light project scripts nevertheless reproduced the retained metrics exactly. To remove this environment deviation from the strict evidence path, the reproducibility-wave branch also adds a GitHub Actions rerun pinned to Node `22.22.0`; use that workflow result as the repository-conformant reproduction record.

## Commands

From the project directory:

```bash
node experiment/run.mjs > run.json
node experiment/ablation.mjs > ablation.json
```

For runtime capture on a Unix-like system:

```bash
/usr/bin/time -p node experiment/run.mjs > run.json 2> run.time
/usr/bin/time -p node experiment/ablation.mjs > ablation.json 2> ablation.time
```

Fresh measured wall times in the initial local environment:

- `experiment/run.mjs`: `0.15 s`
- `experiment/ablation.mjs`: `0.91 s`

These local timings are environment-specific and should not be generalized as benchmark throughput.

## Protocol

### Bounded screen

- 24 anchor queries on `[0,1]`
- seven replicas per anchor
- deterministic smooth latent signal
- deterministic RBF attention
- small key noise
- clean condition: Gaussian value noise
- heavy-tail condition: Cauchy-contaminated values
- baseline: weighted arithmetic mean
- proposed bounded readout: weighted median
- deterministic seeds: 30
- metric: MAE, lower is better

### Contamination ablation

- contamination levels: `0, 0.05, 0.10, 0.18, 0.25, 0.35`
- estimators: arithmetic mean, weighted median, 10% weighted trim, Huber (`delta=0.15`)
- deterministic seeds: 50 per condition
- negative control: 0% Cauchy contamination
- report mean, sample SD, and sample count; retain raw rows for distribution-aware follow-up

## Verification

The initial 2026-08-12 local reproduction matched the checked-in reference to machine precision. Key sentinels:

```text
30-seed heavy-tail mean MAE   0.36152678546712497
30-seed heavy-tail median MAE 0.016560942261867797
30-seed clean mean MAE        0.024354967043193555
30-seed clean median MAE      0.012593962713833545
```

At the primary 18% contamination ablation point (`n=50`):

```text
mean   0.3494393236413256 ± 0.34720341329882964
median 0.017002512132865903 ± 0.004857686860296252
trim   0.04550633252740887 ± 0.01571336013006776
Huber  0.030925536516162495 ± 0.006796244399198665
```

At the 0% negative control, the weighted median still improves strongly over the mean. Treat this as evidence against a uniquely non-Gaussian interpretation of the current bounded task.

## Repository-conformant focused workflow

The branch workflow `.github/workflows/research-repro-wave.yml` pins Node `22.22.0`, reruns the 30-seed screen and 50-seed ablation, verifies the negative control remains present, captures timing/environment files, and uploads the raw JSON as a retained Actions artifact.

## Claim boundary

A successful rerun supports only the synthetic robust-readout mechanism screen. It does not establish a learned memory architecture, Transformer performance, general non-Gaussian memory advantage, or NGMT.
