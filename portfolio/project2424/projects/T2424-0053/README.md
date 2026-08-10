# T2424-0053 — Scientific Motif Dictionary

A dependency-free minimum implementation for indexing repeated **shape motifs** in one-dimensional scientific time series.

## Method

For each sliding window, the tool:

1. z-normalizes the values;
2. computes a fixed piecewise aggregate representation;
3. quantizes aggregate values with frozen breakpoints;
4. forms a deterministic symbolic signature;
5. groups repeated signatures while suppressing trivially overlapping copies.

This makes the minimum experiment invariant to positive affine rescaling of a local pattern: the same shape at a different offset or amplitude receives the same signature.

## Run

```bash
node portfolio/project2424/projects/T2424-0053/experiment/run.mjs
```

## Test

```bash
node --test tests/project2424ScientificMotifDictionary.test.mjs
```

The regression suite checks positive affine invariance, repeated-shape recovery, opposite-trend separation, aggregation structure, and fail-closed input/configuration handling.

## API

```js
windowSignature(series, start, { windowSize, segments })
discoverMotifs(series, { windowSize, segments, stride, minSupport })
summarizeDictionary(series, options)
```

The minimum implementation requires `windowSize` to be divisible by `segments`; that restriction is explicit rather than hidden by interpolation.

## Limitations

- one-dimensional numeric series only;
- fixed symbolic breakpoints rather than data-adaptive quantiles;
- exact signature matching rather than approximate nearest-neighbor motif search;
- positive affine rescaling invariance only; sign reversal intentionally changes the signature;
- greedy non-overlap suppression can miss alternative motif packings;
- synthetic minimum experiment only;
- no claim of scientific novelty, causal structure, semantic meaning, or state-of-the-art motif discovery.

## Claim boundary

This package verifies deterministic normalized-shape indexing mechanics. A repeated signature is not evidence that the pattern is scientifically meaningful.

## Next evidence gate

Freeze a public scientific time-series dataset, predeclare known/relevant motif targets or an external evaluation protocol, compare against simple Euclidean-window and SAX-style baselines, report sensitivity to window/segment/breakpoint choices, and add independent reproduction.
