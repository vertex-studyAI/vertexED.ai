# Research-Family Shared Infrastructure

Related children may share datasets, loaders, simulators, baseline harnesses, plotting code, and evaluation utilities. Shared infrastructure reduces duplicated engineering but must not blur evidence identity.

Every child run still records its own project/experiment ID, protocol/config hash, artifacts, and verdict. A fix to shared infrastructure that changes scientific outputs requires affected experiment versions to be rerun/versioned rather than silently inheriting prior evidence.