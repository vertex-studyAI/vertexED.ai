# NGMT v0.1 Protocol Clarification — Online Ordering

**Committed before implementation or execution.**

The frozen protocol says that prediction of `x[t+1]` uses online memory that has observed the full prefix through `x[t]`. To remove implementation ambiguity, the exact online order is:

1. reset memory at the start of each sequence;
2. consume observations in chronological order;
3. for the first `K=6` observations, seed slot locations deterministically in slot order and initialize their dispersion/mass using the frozen initial-state policy;
4. for every later observation `x[t]`, compute arm-specific write responsibilities from the pre-write state and apply the frozen write rule;
5. after the write, recompute arm-specific read responsibilities against the updated state using query `x[t]`;
6. emit the two read features `(location, dispersion)`;
7. pair those features with the trailing Transformer context ending at `x[t]` to predict `x[t+1]`.

Thus the online memory feature for a prediction never uses the target `x[t+1]` or any future value. B0 emits `(0,0)` at every step. No alternative read-before-write result will be used inside v0.1.
