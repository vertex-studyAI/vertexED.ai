# VertexED AI price review, 9 November 2026

The integrated candidate's reviewed price snapshot expires on 10 November 2026 at 00:00 UTC. A fresh official-source review supports retaining the current text-only contracts for one further review interval, ending **16 November 2026 at 00:00 UTC**. This source candidate is not deployed.

## Meaning and authority

`expiresAt` is a price-review freshness deadline. The existing [beta reconciliation](BETA_ACCESS_RECONCILIATION_2026-10-16.md) says admission fails closed until the model/rate contract is reviewed again and records the owner's authorization to choose the existing limits. [PR #1149](https://github.com/vertex-studyAI/vertexED.ai/pull/1149) established the one-week renewal window; its reviewed policy was subsequently integrated into the current candidate.

This renewal does not raise the USD 1 account / USD 10 shared project daily limits, the 2 account / 8 project unresolved-operation limits, or any output limit. It does not apply a database migration, reset usage, clear unresolved reservations, authorize a live provider call, or approve a release. Existing production and owner approval gates remain open.

## Official contracts reviewed

The official model pages and deprecation schedule were fetched on 9 November 2026.

| Pinned snapshot | Standard uncached input, USD / 1M tokens | Output, USD / 1M tokens | Context tokens | API shutdown |
| --- | ---: | ---: | ---: | --- |
| `gpt-4.1-mini-2025-04-14` | 0.40 | 1.60 | 1,047,576 | 14 January 2027 |
| `gpt-4o-mini-2024-07-18` | 0.15 | 0.60 | 128,000 | 14 January 2027 |

Sources:

- [GPT-4.1 mini model contract](https://developers.openai.com/api/docs/models/gpt-4.1-mini)
- [GPT-4o mini model contract](https://developers.openai.com/api/docs/models/gpt-4o-mini)
- [Official deprecation schedule](https://developers.openai.com/api/docs/deprecations), 14 October 2026 announcement

The rates, context bounds and immutable model identities match the existing implementation. Both models are deprecated. Their published shutdown date is separate from this short review interval; a model migration still needs its own cost contract and quality verification before retirement. Published documentation does not establish access for a particular API account, and no paid availability check was made.

## Candidate behavior

`beta-usd-2026-11-09-v1` retains the existing `validFrom`, text-only allowlist, exact snapshot pinning, default service tier, `store:false`, redirect rejection and 16–4096 output-token range. It still reserves the entire documented context plus the requested output cap at uncached rates. At a 1,200-token output cap, the unchanged reservations are 420,951 and 19,920 microUSD respectively.

At the next expiry, before the start of the valid window, or with an invalid clock value, admission remains unavailable before a ledger reservation or provider dispatch. Read-only account export retains its existing expired-policy behavior. Settlement and ledger state are unchanged.

## Verification

The focused runtime regression exercises admission at the old deadline through reserve, dispatch and settlement using synthetic RPC/provider fixtures, while asserting the unchanged reservation, model and resource limits. A second regression checks the new expiry boundary, the following millisecond, a time before `validFrom`, NaN and Infinity: each must reach neither the ledger nor the provider.

The existing policy, API, settings and runtime suites cover unsupported models and input types, output caps, quota/concurrency denial, duplicate operations, ambiguous usage, cancellation and the read-only export exception. Exact executed test results are recorded in the pull request. No paid provider call, production database operation, merge or deployment is part of this change.
