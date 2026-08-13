# Reproduce T2424-0050

## Environment used

```text
commit=f439498fa6aaf86bb9c0cb37002fcfaa2156c925
node=v22.22.0
npm=10.9.4
kernel=Linux 6.17.0-1022-azure x86_64 GNU/Linux
cpu_count=4
```

## Commands

```bash
node portfolio/project2424/projects/T2424-0050/experiment/run.mjs > /tmp/T2424-0050-darcy.json
node --test tests/project2424DarcyLatentOperator.test.mjs
sha256sum /tmp/T2424-0050-darcy.json
```

Fresh Actions evidence: workflow run `31659677450`, artifact id `9165714770`.

Expected raw-result SHA-256:

```text
67ad7bd98000c58533753b2dd8e70ddebce411780e66f11284c9cfb59206e586
```

Do not reinterpret the controlled aligned synthetic screen as a learned-operator benchmark.
