# T2424-0027 — REPRODUCE

## Frozen revision

Use the Project 2424 implementation from base commit:

```text
0d2a14e559b0caa9b5b1cbeef0995013594ecf15
```

The fresh wave executed at `db9f470ec68f74a95c6e586d88b27927d734dc44` after an implementation-diff guard confirmed the experiment/source/test paths were unchanged from that base.

## Environment

- Ubuntu 24.04.4, x86_64;
- Node `v22.23.1`;
- GitHub Actions run `31616573215`;
- job `94180746280`.

## Commands

Generate a fresh result:

```bash
node portfolio/project2424/projects/T2424-0027/experiment/run.mjs \
  /tmp/t2424-0027-results.json
```

Run the independent evidence verifier:

```bash
node portfolio/project2424/projects/T2424-0027/reproduction/verify.mjs
```

Run focused tests:

```bash
node --test tests/project2424LatentLanguageAudit.test.mjs
```

## Determinism policy

The generator is intentionally deterministic. Do not add arbitrary random seeds and report them as independent replications of the same fixed construction. Reproducibility is assessed by exact output reproduction, the frozen negative control, fail-closed validation and an implementation-independent verifier.

## Evidence retained

Fresh run artifact: `project2424-repro-wave-31616573215`.

Relevant SHA-256 values:

```text
0eac35dd7b8af1488efab0392c2e82dab8f9a90332af7c6ad54633263fa13605  T2424-0027-results.json
1a354c5ef26de30bc99a8b5ace22087e125b865db7326abe48e3bef6cbe7f6c3  T2424-0027-verifier.log
f576c8c38389f609184f6bd4d66bec99b532726ed0fa95e94ce222e85bc01c9f  T2424-0027-tests.log
```

Artifact ZIP digest:

```text
sha256:79b64ebf31607d158e26ba8f74eb9970f9f22722bf7e8c2212dc4a2781860705
```

## Failure policy

Do not change the generator, centroid split, signal strengths, gates or controls after seeing a result. Preserve any failed reproduction or hash mismatch before fixing code, then rerun from a separate commit and label the pre-fix and post-fix evidence distinctly.