# Project 2424 Research-Family / Deduplication Policy

Project 2424 contains 2,424 child identities, but publication units must reflect scientific contributions rather than administrative IDs.

## Rule

A child gets its own standalone paper only when its research question, mechanism, evidence, and contribution are scientifically independent enough to justify a separate manuscript.

If multiple children differ only by application label, benchmark domain, or shallow parameter substitution, they belong to one research family and should normally contribute experiments to a shared paper.

## Required duplicate check

Before a child moves from IDENTIFIED to SPECIFIED:

1. compare the canonical question against every child in its family;
2. search current literature for the closest prior work;
3. classify relation as `INDEPENDENT`, `EXTENSION`, `ABLATION`, `BENCHMARK_VARIANT`, or `DUPLICATE`;
4. if `DUPLICATE`, set `duplicate_of` and do not manufacture a second paper;
5. if `EXTENSION`/`ABLATION`/`BENCHMARK_VARIANT`, decide whether it is a section/experiment of the family paper or truly standalone.

This policy preserves all 2,424 experiments while preventing paper-count inflation and scientifically redundant preprints.