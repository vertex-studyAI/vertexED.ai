# T2424-0036 Status

## Current state

`IMPLEMENTED / CI_VERIFICATION_PENDING`

## Substance present

- [x] orientation-free corner permutation model
- [x] U/R/F and inverse moves
- [x] admissible search heuristic
- [x] deterministic A* implementation
- [x] explicit depth/node resource bounds
- [x] fixed benchmark with returned-path verification
- [x] root-level regression suite
- [x] documented limitations and next gate
- [ ] canonical repository CI verified on this exact branch head
- [ ] full 2×2 corner orientation
- [ ] stronger deterministic baseline comparison (IDA*/pattern database)
- [ ] learned heuristic experiment

## Completion boundary

After exact-head CI passes, this package can count as a **tested search/tool prototype**. It must not be counted as a complete Rubik's Cube solver or an AI/intelligence result because orientation and the full cube state are not represented.

## Expected verification

```bash
node --test tests/project2424T0036RubiksAstar.test.mjs
npm test
npm run ci
```
