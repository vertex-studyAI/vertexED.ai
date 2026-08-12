# T2424-1768 Reproduction Protocol

Pinned source head: `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`.

Verify exact source:

```bash
git hash-object portfolio/project2424/projects/T2424-1768/src/selfVerifyingMoe.mjs
git hash-object portfolio/project2424/projects/T2424-1768/experiment/syntheticBenchmark.mjs
```

Expected blobs:

```text
56a232a680430671abef284e685a6dfc0b23b0cd  src/selfVerifyingMoe.mjs
680e642202e0cce7d83de03b33390f45100f0828  experiment/syntheticBenchmark.mjs
```

Capture environment and execute from the project directory:

```bash
node --version
uname -a
/usr/bin/time -p node experiment/syntheticBenchmark.mjs \
  > experiment/repro-20260812-result.json \
  2> experiment/repro-20260812-runtime.txt
```

Fresh-wave result SHA-256:

```text
1d8290e0d7e25f228df4b212af3db8cbcdf73cb2f9cd6039c7c6208bdc4154b6
```

The current fixture is deterministic and has no random seed. Do not manufacture a variance estimate by rerunning identical deterministic inputs. A future statistical experiment should freeze multiple corruption types/task instances before execution and report the resulting distribution.

Do not change the accepted output range, corruption injection, expert functions, router or gates after observing this result. Any such change is a new experiment version.
