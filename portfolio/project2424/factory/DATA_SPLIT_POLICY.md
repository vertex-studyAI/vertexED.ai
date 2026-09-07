# Data Split / Holdout Policy

When train/development/test separation is scientifically relevant:

- freeze the split policy before confirmatory evaluation;
- keep locked holdout/test data out of iterative tuning;
- record any reused diagnostic set as reused rather than held-out/OOD;
- use chronological splits for temporal/market forecasting where leakage would otherwise occur;
- preserve preprocessing and dataset-version identities;
- never use reserved seeds/examples to rescue a failed development result without creating a new protocol version.
