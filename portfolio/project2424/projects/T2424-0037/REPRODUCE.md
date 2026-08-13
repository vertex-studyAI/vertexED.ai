# Reproduce T2424-0037 NeuroCAD

## Environment

```text
commit=f439498fa6aaf86bb9c0cb37002fcfaa2156c925
node=v22.22.0
npm=10.9.4
kernel=Linux 6.17.0-1022-azure x86_64 GNU/Linux
cpu_count=4
```

## Frozen controlled benchmark

```bash
node portfolio/project2424/projects/T2424-0037/benchmark/run.mjs > /tmp/T2424-0037-benchmark.json
node --test tests/nlpToCad.test.mjs tests/nlpToCadBenchmark.test.mjs
```

## Development OOD/safety benchmark

```bash
node portfolio/project2424/projects/T2424-0037/benchmark/ood_run.mjs > /tmp/T2424-0037-ood.json
sha256sum /tmp/T2424-0037-benchmark.json /tmp/T2424-0037-ood.json
```

Fresh Actions evidence: run `31659677450`, artifact id `9165714770`.

Expected final-wave hashes:

```text
e3e15d79631d1fccd02bc2711f71e98acc1f7f686e390cd65d82fcb054e5c601  T2424-0037-benchmark.json
47df9db7d5a423e340de68e3ac3929b46dab9a138e623f6252a00c8f85e5edd1  T2424-0037-ood.json
```

Preserve the pre-fix result from head `8af9bf7183d38ccb2ae2821384a00ba4bdef2879`; do not rewrite it to make the fixed score appear to have been the original outcome.
