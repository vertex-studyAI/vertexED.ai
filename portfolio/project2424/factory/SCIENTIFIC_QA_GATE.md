# Scientific QA Gate

Before independent reproduction, QA should attempt to falsify the package itself:

- run tests from clean checkout;
- verify inputs and splits;
- recompute metrics from raw outputs;
- check for leakage and data overlap;
- check baseline parity;
- inspect per-seed/per-example results;
- verify thresholds were pre-specified;
- challenge mechanism claims with ablations;
- confirm failures are preserved;
- compare manuscript numbers to artifacts.

Any discrepancy blocks paper promotion until resolved and versioned.