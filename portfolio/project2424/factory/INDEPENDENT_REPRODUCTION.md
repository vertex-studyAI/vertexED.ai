# Independent Reproduction Protocol

The builder who produced the headline result cannot self-certify the reproduction gate.

A verifier receives only:

1. canonical repository/ref;
2. `RESEARCH_SPEC.md`;
3. frozen `PROTOCOL.yaml`;
4. `REPRODUCE.md`;
5. required public/authorized data inputs.

The verifier must run the documented command in a clean environment and record:

- exact commit;
- environment hash;
- dataset/input version;
- config/protocol hash;
- raw artifact checksums;
- primary and secondary metrics;
- whether the headline verdict matches within the pre-specified tolerance;
- any divergence, hidden dependency, ambiguity, or non-determinism.

A failed reproduction is evidence. It must not be silently repaired and relabeled as a pass; changes require a new version and a documented explanation.